import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SpeechService {

  private speechSynthesis = window.speechSynthesis;

  voicesSubject = new BehaviorSubject<SpeechSynthesisVoice[]>([]);
  voices$ = this.voicesSubject.asObservable(); // Store available voices
  voices: SpeechSynthesisVoice[] = [];

  isPlaybackSubject = new BehaviorSubject<boolean>(false);
  isPlayback$: Observable<boolean> = this.isPlaybackSubject.asObservable();
  constructor() {
    window.speechSynthesis.onvoiceschanged = (event) => {
      this.voices = window.speechSynthesis.getVoices();
      this.voicesSubject.next(this.voices);
    }
  }

  getVoices() {
    return this.voices$;
  }

  startPlayback(textToSpeak: string, voiceSpeech: SpeechSynthesisVoice | undefined) {
    // Create a new SpeechSynthesisUtterance object
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Optionally, you can set properties like voice and rate
    // utterance.voice = speechSynthesis.getVoices()[0];
    // utterance.rate = 1.0;
    utterance.lang = 'he-IL';

    utterance.onend = (event) => {
      // this.stopPlayback();
      this.isPlaybackSubject.next(false);
    }

    // utterance.addEventListener('end', evt => {
    //   this.isPlaybackSubject.next(false);
    // });

    // Set the selected voice (based on user choice)
    if (voiceSpeech) {
      const voice: any = this.voices.find(v => v.name === voiceSpeech.name);
      if (voice) {
        utterance.voice = voice;
      }
    }
    this.isPlaybackSubject.next(true);
    // Speak the text
    this.speechSynthesis.speak(utterance);

  }

  isSpeaking(): boolean {
    return this.speechSynthesis.speaking;
  }

  stopPlayback(): void {
    this.speechSynthesis.cancel();
    this.isPlaybackSubject.next(false);
  }
}
