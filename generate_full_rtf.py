import codecs

def generate_full_rtf():
    try:
        with codecs.open('extracted_text.txt', 'r', 'utf-16') as f:
            lines = f.readlines()
    except:
        with codecs.open('extracted_text.txt', 'r', 'utf-8') as f:
            lines = f.readlines()

    header = r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Times New Roman;}} \f0\fs24"
    footer = r"}"
    
    content = ""
    for line in lines:
        line = line.strip()
        if not line:
            content += r"\par"
            continue
            
        # Detect headings (heuristic: shorter lines, uppercase)
        if len(line) < 50 and line.isupper():
            content += r"\qc \b \fs32 " + line + r"\b0 \fs24 \par"
        # Detect subheadings
        elif len(line) < 30:
            content += r"\qc \b " + line + r"\b0 \par"
        else:
            # Body text should be justified
            content += r"\qj " + line + r"\par"
    
    full_rtf = header + content + footer
    with open("Fixed_Project_Final.rtf", "w", encoding='ascii', errors='ignore') as f:
        f.write(full_rtf)

if __name__ == "__main__":
    generate_full_rtf()
