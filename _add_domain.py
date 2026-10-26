from pathlib import Path
p = Path('Backend_Original/src/main/java/com/project/Anusha/config/SecurityConfig.java')
lines = p.read_text(encoding='utf-8').splitlines()
entry = '            \"https://kfpclexports.com\",'.replace('\\\\\"','\"')
anchor = '            \"http://app.anushabazaar.com\",'.replace('\\\\\"','\"')
if entry not in lines:
    lines.insert(lines.index(anchor) + 1, entry)
p.write_text('\n'.join(lines) + '\n', encoding='utf-8')
