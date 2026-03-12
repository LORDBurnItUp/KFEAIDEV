import sounddevice as sd
import soundfile as sf
import keyboard
import numpy as np
import uuid
import os
import tkinter as tk
import threading

LISTENING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Listening"))

class VoiceOverlay(tk.Tk):
    def __init__(self):
        super().__init__()
        self.overrideredirect(True)
        self.attributes('-topmost', True)
        self.attributes('-alpha', 0.9)
        self.configure(bg='black')
        
        # Cyberpunk style border
        self.frame = tk.Frame(self, bg='#00ffcc', bd=2)
        self.frame.pack(fill='both', expand=True)

        self.label = tk.Label(
            self.frame, 
            text=" 🎙️ ANTIGRAVITY : SYNCHRONIZING... ", 
            font=("Consolas", 12, "bold"), 
            fg="#00ffcc", 
            bg="#0a0a0a", 
            padx=20, pady=5
        )
        self.label.pack(fill='x')

        # Text input field
        self.entry = tk.Entry(
            self.frame,
            font=("Consolas", 14),
            bg="#111",
            fg="white",
            insertbackground="white",
            bd=0,
            highlightthickness=1,
            highlightbackground="#333",
            highlightcolor="#00ffcc"
        )
        self.entry.pack(fill='x', padx=10, pady=5)
        self.entry.bind("<Return>", lambda e: self.trigger_toggle())

        # Center top of screen
        sw = self.winfo_screenwidth()
        window_width = 600
        window_height = 85
        self.geometry(f"{window_width}x{window_height}+{sw//2 - window_width//2}+30")
        self.withdraw()  # Hidden by default

        self.recording = False
        self.fs = 16000
        self.channels = 1
        self.audio_data = []
        self.stream = None

        # Setup global hotkey (runs in a separate background thread natively by keyboard package)
        keyboard.add_hotkey('shift+alt', self.trigger_toggle)

    def callback(self, indata, frames, time, status):
        if self.recording:
            self.audio_data.append(indata.copy())

    def trigger_toggle(self):
        # Route the threaded callback back to the main GUI thread
        self.after(0, self.toggle_record)

    def toggle_record(self):
        if not self.recording:
            self.audio_data = []
            self.recording = True
            
            self.label.config(text=" 🎙️ | ANTIGRAVITY LISTENING | 🎙️ ", fg="#00ffcc")
            self.entry.delete(0, tk.END)
            self.deiconify() # Reveal the floating bar
            self.entry.focus_set()
            self.update()

            self.stream = sd.InputStream(samplerate=self.fs, channels=self.channels, callback=self.callback)
            self.stream.start()
            
            try:
                import winsound
                winsound.Beep(1200, 150)
                winsound.Beep(1600, 200)
            except: pass
        else:
            self.recording = False
            user_text = self.entry.get().strip()
            self.label.config(text=" ⚙️ PROCESSING NEURAL FEED... ", fg="#ffff00")
            self.update()

            if self.stream:
                self.stream.stop()
                self.stream.close()
                self.stream = None
            
            try:
                import winsound
                winsound.Beep(800, 150)
                winsound.Beep(600, 200)
            except: pass
            
            session_id = uuid.uuid4().hex[:6]
            
            # Save Audio
            if self.audio_data:
                final_data = np.concatenate(self.audio_data, axis=0)
                if not os.path.exists(LISTENING_DIR):
                    os.makedirs(LISTENING_DIR)
                
                audio_filename = f"user_voice_{session_id}.wav"
                audio_filepath = os.path.join(LISTENING_DIR, audio_filename)
                sf.write(audio_filepath, final_data, self.fs)

            # Save Text
            if user_text:
                if not os.path.exists(LISTENING_DIR):
                    os.makedirs(LISTENING_DIR)
                text_filename = f"user_text_{session_id}.txt"
                text_filepath = os.path.join(LISTENING_DIR, text_filename)
                with open(text_filepath, "w", encoding="utf-8") as f:
                    f.write(user_text)
            
            # Briefly show status then hide
            status_text = " ✅ INJECTED INTO SECOND BRAIN "
            if user_text and not self.audio_data:
                status_text = " ✅ TEXT COMMAND SENT "
            elif user_text and self.audio_data:
                status_text = " ✅ MULTIMODAL PACKET SENT "

            self.label.config(text=status_text, fg="#00ff00")
            self.update()
            self.after(1500, self.withdraw)

if __name__ == "__main__":
    app = VoiceOverlay()
    app.mainloop()
