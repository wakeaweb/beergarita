import sys
import subprocess
try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image

def crop_transparent(image_path):
    img = Image.open(image_path).convert('RGBA')
    bbox = img.getbbox()
    if bbox:
        img.crop(bbox).save(image_path)

crop_transparent('assets/header-flags-desktop-new.png')
crop_transparent('assets/header-flags-mobile-new.png')
