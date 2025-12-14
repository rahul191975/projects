import speech_recognition as sr
import pyttsx3
import webbrowser
import wikipedia
import datetime
import os

# Initialize the recognizer and engine
recognizer = sr.Recognizer()
engine = pyttsx3.init()

def speak(text):
    """Convert text to speech."""
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen to the user's voice command."""
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        print("Recognizing...")
        command = recognizer.recognize_google(audio)
        print(f"User said: {command}\n")
        return command.lower()
    except Exception as e:
        print(f"Error: {e}")
        speak("Sorry, I didn't catch that. Could you please repeat?")
        return None

def process_command(command):
    """Process the user's command and execute appropriate actions."""
    if "hello" in command or "hi" in command:
        speak("Hello! How can I assist you today?")

    elif "time" in command:
        current_time = datetime.datetime.now().strftime("%H:%M")
        speak(f"The current time is {current_time}")

    elif "date" in command:
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")
        speak(f"Today's date is {current_date}")

    elif "search" in command or "google" in command:
        speak("What would you like me to search for?")
        search_query = listen()
        if search_query:
            url = f"https://www.google.com/search?q={search_query}"
            webbrowser.open(url)
            speak(f"Here are the search results for {search_query}")

    elif "wikipedia" in command:
        speak("What would you like to search on Wikipedia?")
        wiki_query = listen()
        if wiki_query:
            try:
                result = wikipedia.summary(wiki_query, sentences=2)
                speak("According to Wikipedia")
                speak(result)
            except Exception as e:
                speak("Sorry, I couldn't find any information on that topic.")

    elif "open" in command:
        if "youtube" in command:
            webbrowser.open("https://www.youtube.com")
            speak("Opening YouTube")
        elif "google" in command:
            webbrowser.open("https://www.google.com")
            speak("Opening Google")
        elif "github" in command:
            webbrowser.open("https://www.github.com")
            speak("Opening GitHub")

    elif "exit" in command or "quit" in command or "bye" in command:
        speak("Goodbye! Have a great day.")
        exit()

    else:
        speak("I'm not sure how to help with that. Could you please repeat or ask something else?")

def main():
    speak("Hello! I am your AI voice assistant. How can I help you today?")

    while True:
        command = listen()
        if command:
            process_command(command)

if __name__ == "__main__":
    main()
