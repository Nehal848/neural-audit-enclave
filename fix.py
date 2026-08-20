content = open('app/main.py', encoding='utf-8').read()
content = content.replace('class OTPSendPayload(BaseModel):', 'from pydantic import BaseModel\nclass OTPSendPayload(BaseModel):')
open('app/main.py', 'w', encoding='utf-8').write(content)
