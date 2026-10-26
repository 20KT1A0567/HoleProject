
from moviepy.editor import *
from gtts import gTTS
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
W, H      = 1080, 540
LOGO_PATH = "anusha_bazaar_logo.png"   
BG_COLOR  = (15, 52, 140)              # deep royal blue
FPS       = 24

# ─────────────────────────────────────────────
# 1. GENERATE VOICE (gTTS)
# ─────────────────────────────────────────────
text = """
Welcome to Anusha Bazaar!
Groceries at your doorstep in minutes.
Get fresh vegetables, dairy, fruits and snacks at best prices.
Enjoy flat 50 rupees off and free delivery on your first order.
Vegetables at 30 percent off.
Dairy at 25 percent off.
Fruits at 20 percent off.
Snacks at 30 percent off.
Fast delivery, fresh products and secure payments.
Download Anusha Bazaar now from Play Store!
"""

if not os.path.exists("voice.mp3"):
    print("Generating voice...")
    tts = gTTS(text=text, lang='en', slow=False)
    tts.save("voice.mp3")
    print("Voice saved.")

# ─────────────────────────────────────────────
# 2. HELPER: make text image with PIL (Removes ImageMagick dependency)
# ─────────────────────────────────────────────
def create_text_image(text, width=W, height=H, bg_color=None, text_color="white", font_size=60):
    # Create an image with transparent or solid background
    mode = "RGBA" if bg_color is None else "RGB"
    bg = (0,0,0,0) if bg_color is None else bg_color
    img = Image.new(mode, (width, height), bg)
    draw = ImageDraw.Draw(img)
    
    # Try to load a generic font, or fallback to default
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except:
        font = ImageFont.load_default()
        
    # Handle multi-line text mapping
    lines = text.split('\n')
    
    # Calculate total height to center vertically
    try:
        # Pillow >= 8.0.0
        line_heights = [draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in lines]
        
        total_height = sum(line_heights) + 20 * (len(lines) - 1)
        y = (height - total_height) // 2
        
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            w = bbox[2] - bbox[0]
            x = (width - w) // 2
            draw.text((x, y), line, fill=text_color, font=font)
            y += line_heights[i] + 20
    except AttributeError:
        # Older Pillow
        total_height = sum([draw.textsize(line, font=font)[1] for line in lines]) + 20 * (len(lines) - 1)
        y = (height - total_height) // 2
        
        for line in lines:
            w, h = draw.textsize(line, font=font)
            x = (width - w) // 2
            draw.text((x, y), line, fill=text_color, font=font)
            y += h + 20
            
    return np.array(img)

# ─────────────────────────────────────────────
# 3. HELPER: overlay logo
# ─────────────────────────────────────────────
def add_logo(base_clip):
    if not os.path.exists(LOGO_PATH):
        return base_clip
    logo = (ImageClip(LOGO_PATH)
            .resize(height=100)
            .set_duration(base_clip.duration)
            .set_position((30, 20))
            .set_opacity(0.92))
    return CompositeVideoClip([base_clip, logo])

# ─────────────────────────────────────────────
# 4. HELPER: build a scene
# ─────────────────────────────────────────────
def scene(title, subtitle, duration, title_color='#FFD700', sub_color='white', bg_color=BG_COLOR):
    # Base background
    bg = ColorClip(size=(W, H), color=bg_color, duration=duration)

    # Title text
    title_img = create_text_image(title, width=W, height=180, text_color=title_color, font_size=72)
    title_clip = ImageClip(title_img).set_duration(duration).set_position(('center', 150))

    clips_to_compose = [bg, title_clip]

    if subtitle:
        sub_img = create_text_image(subtitle, width=W, height=120, text_color=sub_color, font_size=40)
        sub_clip = ImageClip(sub_img).set_duration(duration).set_position(('center', 330))
        clips_to_compose.append(sub_clip)

    composite = CompositeVideoClip(clips_to_compose)
    return add_logo(composite)

# ─────────────────────────────────────────────
# 5. BUILD SCENES  (total ≈ 60 s)
# ─────────────────────────────────────────────
print("Building scenes...")

s1 = scene(
    "Anusha Bazaar",
    "Groceries at Your Doorstep - Hyderabad's Trusted App",
    duration=10
)

s2 = scene(
    "Delivery in Minutes",
    "Order now and get fresh groceries at your door - Fast & Reliable!",
    duration=10
)

s3 = scene(
    "Rs 50 OFF + FREE Delivery",
    "On Your First Order  |  Limited Time Offer!",
    duration=10,
    title_color='#FF4444'
)

s4 = scene(
    "30% OFF Vegetables\n25% OFF Dairy",
    "20% OFF Fruits  |  30% OFF Snacks",
    duration=12,
    title_color=(74, 222, 128),
    sub_color='#FFD700'
)

s5 = scene(
    "Fresh Products\nSecure Payments",
    "24/7 Support  |  Real-Time Order Tracking",
    duration=10,
    title_color='white',
    sub_color=(147, 197, 253)
)

s6 = scene(
    "Download Anusha Bazaar",
    "Available on Google Play Store - Install Now!",
    duration=8,
    title_color='#FFD700',
    bg_color=(0, 100, 40)
)

# ─────────────────────────────────────────────
# 6. CONCATENATE + ADD AUDIO
# ─────────────────────────────────────────────
print("Concatenating clips...")
video = concatenate_videoclips([s1, s2, s3, s4, s5, s6], method='compose')

print("Adding audio...")
audio = AudioFileClip("voice.mp3")

video_dur = video.duration
audio_dur = audio.duration
if audio_dur < video_dur:
    audio = audio.audio_loop(duration=video_dur)
else:
    audio = audio.subclip(0, video_dur)

video = video.set_audio(audio)

# ─────────────────────────────────────────────
# 7. EXPORT
# ─────────────────────────────────────────────
print("Exporting video... (this may take a few minutes)")
video.write_videofile(
    "anusha_bazaar_video.mp4",
    fps=FPS,
    codec='libx264',
    audio_codec='aac',
    threads=4,
    preset='ultrafast'
)
print("Done! Video saved as anusha_bazaar_video.mp4")
