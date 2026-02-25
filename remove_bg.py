import sys
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Processing {input_path}")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # We will sample the background color from the top-left pixel
    # If there is a chance it's not exactly uniform, we might average a few
    bg_color = img.getpixel((0, 0))
    print(f"Detected background color: {bg_color}")
    
    new_data = []
    for y in range(height):
        for x in range(width):
            pixel = img.getpixel((x, y))
            # Calculate Manhattan distance from the background color
            diff = sum(abs(pixel[i] - bg_color[i]) for i in range(3))
            
            # 0 to 20: fully transparent
            # 20 to 60: partially transparent for an anti-aliased edge
            if diff < 20:
                new_data.append((pixel[0], pixel[1], pixel[2], 0))
            elif diff < 60:
                # scale alpha smoothly between 0 and 255
                alpha = int((diff - 20) / 40.0 * 255)
                new_data.append((pixel[0], pixel[1], pixel[2], alpha))
            else:
                new_data.append(pixel)
                
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

if __name__ == '__main__':
    remove_background("public/tanush-logo.png", "public/tanush-logo-transparent.png")
