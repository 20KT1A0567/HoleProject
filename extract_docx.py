import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in unicode.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.fromstring(xml_content)
    
    # Namespaces are usually like {http://schemas.openxmlformats.org/wordprocessingml/2006/main}
    # We can get the namespace from the root element
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    text = ""
    for paragraph in tree.findall('.//w:p', ns):
        texts = paragraph.findall('.//w:t', ns)
        if texts:
            for t in texts:
                if t.text:
                    text += t.text
            text += "\n"
    return text

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = get_docx_text(sys.argv[1])
        sys.stdout.buffer.write(text.encode('utf-8'))
