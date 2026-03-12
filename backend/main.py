from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from sigfast import ema, detect_anomalies # YOUR BRAND NEW LIBRARY!

app = FastAPI()

# Allow the frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_data(file: UploadFile = File(...)):
    # 1. Read the uploaded CSV
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # We assume the CSV has a 'date' column and a 'price' column
    date_col = df.columns[0]
    price_col = df.columns[1]
    
    # 2. Extract the numbers
    prices = df[price_col].values
    
    # 3. RUN SIGFAST (Your C-speed engine!)
    df['EMA_20'] = ema(prices, span=20)
    df['Is_Anomaly'] = detect_anomalies(prices, threshold=2.5) # Detect wild spikes
    
    # 4. Format data for the React Chart
    chart_data =[]
    for _, row in df.iterrows():
        chart_data.append({
            "date": str(row[date_col]),
            "price": round(row[price_col], 2),
            "ema": round(row['EMA_20'], 2),
            "anomaly": round(row[price_col], 2) if row['Is_Anomaly'] else None
        })
        
    return {"status": "success", "data": chart_data}