"""Generate desert-themed pixel-art beetle icons."""
import struct
import zlib
import os

# 16x16 brown beetle pushing a golden ball
BEETLE_16 = [
    "................",
    ".....DD.DD......",
    "....D..DD.D.....",
    "....DBBBD.......",
    "...DBBBBBD......",
    "..DBBB.BBBD.....",
    "..DBBBBBBBD.....",
    "..DBBBBBBD.GG...",
    "...DBBBBBD.GGGG.",
    "...DBBBBBDGGYGG.",
    "....DBBBD.GGGGG.",
    ".....DDD..GGYGG.",
    "....D...D..GGGG.",
    "...D.....D..GG..",
    "................",
    "................",
]

COLORS = {
    "B": (92, 61, 30, 255),     # brown body
    "D": (61, 43, 26, 255),     # dark brown outline
    "G": (196, 148, 58, 255),   # gold ball
    "Y": (212, 168, 74, 255),   # gold highlight
    ".": (0, 0, 0, 0),
}


def make_png(width, height, pixels):
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + c + crc

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))

    raw = b""
    for y in range(height):
        raw += b"\x00"
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw += struct.pack("BBBB", r, g, b, a)

    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")

    return header + ihdr + idat + iend


def generate_icon(size, output_path):
    px = size // 16
    pixels = []

    for y in range(size):
        for x in range(size):
            grid_y = y // px
            grid_x = x // px
            if 0 <= grid_y < 16 and 0 <= grid_x < 16:
                ch = BEETLE_16[grid_y][grid_x]
                pixels.append(COLORS.get(ch, (0, 0, 0, 0)))
            else:
                pixels.append((0, 0, 0, 0))

    data = make_png(size, size, pixels)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(data)
    print(f"  Created {output_path} ({size}x{size}, {len(data)} bytes)")


if __name__ == "__main__":
    ext_base = os.path.join(os.path.dirname(__file__), "..", "extension", "assets")
    web_base = os.path.join(os.path.dirname(__file__), "..", "web", "public")

    for size in [16, 48, 128]:
        generate_icon(size, os.path.join(ext_base, f"icon-{size}.png"))

    generate_icon(128, os.path.join(web_base, "beetle-128.png"))
    generate_icon(48, os.path.join(web_base, "favicon-48.png"))

    print("Done!")
