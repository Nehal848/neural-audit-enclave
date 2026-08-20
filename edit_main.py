import re
content = open('app/main.py', encoding='utf-8').read()
content = re.sub(r'#.*Frontend \(Next.js on :3000\).*?status_code=302\)', '', content, flags=re.DOTALL)
content += '\n\nif (_frontend_dir / "out").exists():\n    app.mount("/", _SF(directory=str(_frontend_dir / "out"), html=True), name="frontend")\n'
open('app/main.py', 'w', encoding='utf-8').write(content)
