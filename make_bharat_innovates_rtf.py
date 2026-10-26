from pathlib import Path
import re


def escape_rtf(text: str) -> str:
    text = text.replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}")
    text = text.replace("–", "-").replace("—", "-").replace("’", "'")
    return text


def inline_format(text: str) -> str:
    text = escape_rtf(text)
    text = re.sub(r"`([^`]+)`", r"\\f1 \1\\f0 ", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\\b \1\\b0 ", text)
    return text


def markdown_to_rtf(markdown: str) -> str:
    lines = markdown.splitlines()
    out = []
    in_code = False
    in_table = False

    for raw in lines:
        line = raw.rstrip()

        if line.startswith("```"):
            in_code = not in_code
            if not in_code:
                out.append(r"\par")
            continue

        if in_code:
            out.append(r"\pard\li360\f1\fs20 " + escape_rtf(line) + r"\f0\fs24\par")
            continue

        if not line.strip():
            out.append(r"\par")
            in_table = False
            continue

        if line.startswith("# "):
            title = inline_format(line[2:].strip())
            out.append(r"\page\pard\qc\b\fs36 " + title + r"\b0\fs24\par\par")
            continue

        if line.startswith("## "):
            heading = inline_format(line[3:].strip())
            out.append(r"\pard\sb240\sa120\b\fs28 " + heading + r"\b0\fs24\par")
            continue

        if line.startswith("### "):
            heading = inline_format(line[4:].strip())
            out.append(r"\pard\sb180\sa80\b\fs24 " + heading + r"\b0\par")
            continue

        if line.startswith("- "):
            item = inline_format(line[2:].strip())
            out.append(r"\pard\li360\fi-180\tx360\qj \bullet\tab " + item + r"\par")
            continue

        if line.startswith("|") and line.endswith("|"):
            if re.fullmatch(r"\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|", line):
                continue
            cells = [inline_format(cell.strip()) for cell in line.strip("|").split("|")]
            if not in_table:
                out.append(r"\pard\sb120\b Roadmap\par")
                in_table = True
            out.append(r"\pard\li180 " + r" \tab ".join(cells) + r"\par")
            continue

        paragraph = inline_format(line)
        out.append(r"\pard\qj " + paragraph + r"\par")

    body = "".join(out).replace(r"\page\pard\qc\b\fs36 Project Proposal", r"\pard\qc\b\fs36 Project Proposal")
    return (
        r"{\rtf1\ansi\deff0"
        r"{\fonttbl{\f0 Times New Roman;}{\f1 Courier New;}}"
        r"\paperw11907\paperh16840\margl1440\margr1440\margt1440\margb1440"
        r"\f0\fs24 "
        + body
        + "}"
    )


def convert(src: str, dst: str) -> None:
    markdown = Path(src).read_text(encoding="utf-8")
    rtf = markdown_to_rtf(markdown)
    Path(dst).write_text(rtf, encoding="ascii", errors="ignore")


if __name__ == "__main__":
    convert("Bharat_Innovates_2026_Proposal_Anusha_Bazaar.md", "Bharat_Innovates_2026_Proposal_Anusha_Bazaar.rtf")
    convert("Bharat_Innovates_2026_Startup_Profile_Anusha_Bazaar.md", "Bharat_Innovates_2026_Startup_Profile_Anusha_Bazaar.rtf")
