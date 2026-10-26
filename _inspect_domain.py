from pathlib import Path
lines = Path('Backend_Original/src/main/java/com/project/Anusha/config/SecurityConfig.java').read_text(encoding='utf-8').splitlines()
for i,l in enumerate(lines):
    if 'app.anushabazaar.com' in l or 'kfpclexports' in l: print(i, repr(l))
