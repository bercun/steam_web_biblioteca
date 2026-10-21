#!/usr/bin/env python3
"""
USB barcode scanner (keyboard) + search.php + Arduino LCD over Serial.

The scanner types a barcode and Enter into this terminal.
search.php looks up the book, then this script sends to the LCD:
  Title|450.00
or
  Book not found
"""

from __future__ import annotations

import argparse
import sys
import time
from urllib.parse import quote

import requests
import serial
from serial.tools import list_ports


DEFAULT_API = "http://localhost:3000/search.php"
DEFAULT_BAUD = 9600


def list_serial_ports() -> None:
    ports = list(list_ports.comports())
    if not ports:
        print("No se encontraron puertos seriales.")
        return
    print("Puertos disponibles:")
    for port in ports:
        print(f"  {port.device:20} {port.description}")


def lookup_book(api_url: str, barcode: str, timeout: float = 5.0) -> str:
    url = f"{api_url}?q={quote(barcode)}&format=text"
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        text = (response.text or "").strip()
        return text if text else "Book not found"
    except requests.RequestException as exc:
        print(f"[API error] {exc}", file=sys.stderr)
        return "Book not found"


def send_to_arduino(ser: serial.Serial, message: str) -> None:
    ser.write((message.strip() + "\n").encode("utf-8"))
    ser.flush()
    print(f"→ Arduino: {message}")


def open_serial(port: str, baud: int) -> serial.Serial:
    ser = serial.Serial(port=port, baudrate=baud, timeout=1)
    time.sleep(2)
    ser.reset_input_buffer()
    return ser


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Puente: lector de códigos → search.php → Arduino"
    )
    parser.add_argument(
        "--port",
        help="Puerto COM/tty del Arduino, por ejemplo COM3",
    )
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD)
    parser.add_argument("--api", default=DEFAULT_API, help="URL search.php")
    parser.add_argument(
        "--list-ports",
        action="store_true",
        help="Mostrar los puertos seriales y salir",
    )
    args = parser.parse_args()

    if args.list_ports:
        list_serial_ports()
        return 0

    if not args.port:
        print("Indica el puerto del Arduino: --port COM5")
        print("Lista de puertos: python bridge.py --list-ports")
        return 1

    try:
        ser = open_serial(args.port, args.baud)
    except serial.SerialException as exc:
        print(f"No se pudo abrir {args.port}: {exc}", file=sys.stderr)
        return 1

    print(f"Puerto {args.port} @ {args.baud} baudios")
    print(f"API: {args.api}")
    print("Escanea un código (o escribe un título y pulsa Enter). Ctrl+C para salir.\n")

    try:
        while True:
            try:
                barcode = input("Barcode> ").strip()
            except EOFError:
                break

            if not barcode:
                continue

            result = lookup_book(args.api, barcode)
            print(f"API: {result}")
            send_to_arduino(ser, result)
    except KeyboardInterrupt:
        print("\nPrograma detenido.")
    finally:
        ser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
