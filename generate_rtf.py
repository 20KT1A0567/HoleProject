def generate_rtf():
    header = r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Times New Roman;}} \f0\fs24"
    footer = r"}"
    
    # Title Page
    content = r"\qc \b \fs48 SECURE CLOUD BASED FILE ENCRYPTION \b0 \fs24 \par \par"
    content += r"\qc \i A Main Project Report \i0 \par"
    content += r"\qc \b Bachelor of Technology \b0 \par"
    content += r"\qc \i in \i0 \par"
    content += r"\qc \b Computer Science and Engineering \par (Artificial Intelligence and Machine Learning) \b0 \par \par"
    
    content += r"\qc \b By \b0 \par"
    content += r"\qc VEERAPANI ANJALI (22HU1A42B0) \par"
    content += r"\qc PILLI MERI GNANA KUSUMANJALI (22HU1A4266) \par"
    content += r"\qc POLURI MOUNIKA (22HU1A4268) \par"
    content += r"\qc MANDAPATI ASHOK KUMAR (22HU1A4248) \par"
    content += r"\qc NAGA SAI BOPPANA (22HU1A4212) \par \par"
    
    content += r"\qc \b Under the Esteemed Guidance of \b0 \par"
    content += r"\qc \b DR. G. BHARATHI \b0 \par"
    content += r"\qc \i Associate Professor \i0 \par \par \par"
    
    content += r"\qc \b DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING \par"
    content += r"CHEBROLU ENGINEERING COLLEGE (UGC-AUTONOMOUS) \b0 \par"
    content += r"\page" # Page break
    
    # Abstract
    content += r"\qc \b \fs36 ABSTRACT \b0 \fs24 \par \par"
    content += r"\qj The increasing reliance on cloud storage services has raised significant concerns regarding data confidentiality, integrity, and unauthorized access. To address these challenges, this work presents a secure cloud-based file encryption system designed to protect sensitive user data before it is uploaded to remote servers. \par \par"
    content += r"\qj The system employs strong cryptographic algorithms, such as AES and RSA, to ensure end-to-end security by encrypting files locally on the user's device and allowing only authenticated users to decrypt them. \par"
    
    full_rtf = header + content + footer
    with open("Fixed_Project_v2.rtf", "w") as f:
        f.write(full_rtf)

if __name__ == "__main__":
    generate_rtf()
