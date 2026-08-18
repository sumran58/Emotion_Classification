from fastapi import FastAPI,HTTPException 
import re #for data cleaning 
from pydantic import BaseModel,Field 
from tensorflow.keras.models import load_model
import pickle 
from contextlib import asynccontextmanager 
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import FileResponse 
from tensorflow.keras.preprocessing.text import Tokenizer 
from tensorflow.keras.preprocessing.sequence import pad_sequences 
import numpy as np 
from fastapi.staticfiles import StaticFiles 


#model path 
model_path="Artifacts/bigru_model_fixed.keras" 
 
#tokenizer path 
tokenizer_path="Artifacts/tokenizer.pkl" 
 
#max sequence length 
max_sequence=50 
 
#emotion labels 
emotion_labels=['sadness','joy','love','anger','fear','surprise'] 
 
#emotion emojis 
#E. Emotion emojis 
EMOTION_EMOJIS = { 
    "sadness": "😭", 
    "joy": "😁", 
    "love": "❤️", 
    "anger": "😠", 
    "fear": "😨", 
    "surprise": "😮" 
} 
 
"""preprocessing the text""" 
def preprocess(text:str)->str: 
    #clean raw text so it matches the format used while training 
    """1.convert the text to lower case 
       2.remove the apostophes 
       3.remove the special characters 
       4.remove extra spaces""" 
 
    text=text.lower() 
    text=re.sub(r"'","",text) 
    text=re.sub(r"[^a-z0-9\s]","",text) 
    text=re.sub(r"\s+"," ",text).strip() 
    return text 
 
""" 
request and reponse schemas 
1.text input (means the tetx sent by by the user) 
2.prediction response 
3.server health 
""" 
class TextInput(BaseModel): 
    text  : str=Field(..., 
                   min_length=1, 
                   max_length=2000, 
                   description="The sentence to analyze", 
                   json_schema_extra={"example":"i am feeling bad today"} #if we want to show the example like how can be the input declared 
 
                    ) 
 
class PredictionResponse(BaseModel): 
    text:str 
    predicted_emotion:str 
    confidence:float 
    all_probabilities:dict[str,float] 
 
class HealthResponse(BaseModel): 
    status:str 
    model_loaded:bool 
 
""" 
model loading and life span management 
1.load the model and the tokenizer 
""" 
dl_model={} 
@asynccontextmanager 
#@asynccontextmanager lets you define setup and cleanup around an async with block, with yield marking the point where your application gets control.because this is gfoing to work 2 works before starting the server and after the server has been shutdown 
async def lifespan(app:FastAPI): 
    print("loading the model and the tokenizer....") 
    dl_model["BiGRU"]=load_model(model_path) 
    with open(tokenizer_path,'rb') as file: 
        dl_model["Tokenizer"]=tokenizer=pickle.load(file) 
    print("model are loaded successfully!..") 
    yield #model will wait here for thr request 
    dl_model.clear() #once the server is off we will remopve the model from the memory  


app=FastAPI(lifespan=lifespan) 
 
""" 
mount the static file to fastapi  
1.enable the CORS 
""" 
 
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"] 
) 
 
app.mount('/static',StaticFiles(directory="static"),name="static") 
 
"""API Endpoints 
1.server ui homepage('/') 
2.health check endpoint('/health') 
3.prediction endpoint('/predict') 
""" 
 
@app.get('/',include_in_schema=False) 
def server_ui(): 
    return FileResponse('static/index.html')  
 
@app.get('/health',response_model=HealthResponse) 
def health_check(): 
    return HealthResponse(status="server is running",model_loaded=bool(dl_model))#dl_model  ek dictionary hai jisme 2 models hai agar dono model rahege to true and kuch nhi to false 
 
@app.post('/predict',response_model=PredictionResponse) 
def predict_emotion(text_input:TextInput): 
    #1.clean the input sentence 
 
    #2.convert the words into numeric using tokenizer 
    #3.pad the sequence to ensure uniform lenghth 
    #4.run prediction using bigru model 
    #5.return the top emotions and full probability breakdown 
    BiGRU_model=dl_model.get("BiGRU") 
    tokenizer_model=dl_model.get("Tokenizer") 
 
    if BiGRU_model is None or tokenizer_model is None: 
        raise HTTPException(status_code=503,detail="model is not loaded yet please try it again later") 
 
    cleaned_text=preprocess(text_input.text) 
    
    tokenized_text=tokenizer_model.texts_to_sequences([cleaned_text]) 
 
    padded_sequence=pad_sequences(tokenized_text,maxlen=max_sequence,padding="post",truncating="post") 
 
    probabilities=BiGRU_model.predict(padded_sequence)[0] 
 
    top_emotion_index=int(np.argmax(probabilities)) 
 
    all_probabilities={ label:float(prob) for label,prob in zip(emotion_labels,probabilities)} 
 
    return PredictionResponse( 
        text=text_input.text, 
        predicted_emotion=emotion_labels[top_emotion_index], 
        confidence=float(probabilities[top_emotion_index]), 
        all_probabilities=all_probabilities 
 
       )