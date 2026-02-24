# Pharos Agents

Automated investment analysis and reporting backend system.

## Environment Setup

1. **Create Virtual Environment**
   ```sh
   python3 -m venv venv
   ```

2. **Activate Virtual Environment**
   - MacOS/Linux:
     ```sh
     source venv/bin/activate
     ```
   - Windows:
     ```sh
     .\venv\Scripts\activate
     ```

3. **Install Dependencies**
   ```sh
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Copy `.env.example` to `.env` and fill in the required values.
   ```sh
   cp .env.example .env
   ```

## Running the Application

```sh
uvicorn src.main:app --reload
```
