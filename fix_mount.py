content = open('app/main.py', encoding='utf-8').read()
if 'name="frontend"' not in content:
    content += '\nif (_frontend_dir / "out").exists():\n    app.mount("/", _SF(directory=str(_frontend_dir / "out"), html=True), name="frontend")\n'
    open('app/main.py', 'w', encoding='utf-8').write(content)
