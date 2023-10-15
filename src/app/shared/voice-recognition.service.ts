import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition: any;
  isStoppedSpeechRecog = false;
  public text = '';
  private voiceToTextSubject: Subject<string> = new Subject();
  private speakingPaused: Subject<any> = new Subject();
  private tempWords: string = '';

  // BCP 47 Language Tags https://www.techonthenet.com/js/language_tags.php
  langSupport: Language[] = [
    {name: 'English', code: 'en-US'},
    {name: 'Hebrew', code: 'he-IL'},
    {name: 'Russian', code: 'ru-RU'}
  ]

  constructor() {
  }

  /**
   * @description Function to return observable so voice sample text can be send to input.
   */
  speechInput() {
    return this.voiceToTextSubject.asObservable();
  }

  /**
   * @description Function to initialize voice recognition.
   */
  init() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    // this.recognition.lang = 'he-IL';

    this.recognition.addEventListener('result', (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.tempWords = transcript;
      this.voiceToTextSubject.next(this.text || transcript);
    });
    return this.initListeners();
  }

  /**
   * @description Function to change language voice recognition.
   */
  changeLanguage(lang: string): void {
    this.recognition.lang = lang;
  }

  /**
   * @description Add event listeners to get the updated input and when stoped
   */
  initListeners() {
    this.recognition.addEventListener('end', (condition: any) => {
      this.recognition.stop();
    });
    return this.speakingPaused.asObservable();
  }

  /**
   * @description Function to mic on to listen.
   */
  start() {
    this.text = '';
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    this.recognition.addEventListener('end', (condition: any) => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.isActive = true;
        this.recognition.stop();
      } else {
        this.isStoppedSpeechRecog = false;
        this.wordConcat();
        // Checked time with last api call made time so we can't have multiple start action within 200ms for countinious listening
        // Fixed : ERROR DOMException: Failed to execute 'start' on 'SpeechRecognition': recognition has already started.
        if (!this.recognition.lastActiveTime || (Date.now() - this.recognition.lastActive) > 200) {
          this.recognition.start();
          this.recognition.lastActive = Date.now();
        }
      }
      this.voiceToTextSubject.next(this.text);
    });
  }

  /**
   * @description Function to stop recognition.
   */
  stop() {
    // this.text = '';
    this.isStoppedSpeechRecog = true;
    this.wordConcat()
    this.recognition.stop();
    this.recognition.isActive = false;
    this.speakingPaused.next('Stopped speaking');
  }

  /**
   * @description Merge previous input with latest input.
   */
  wordConcat() {
    this.text = this.text.trim() + ' ' + this.tempWords;
    this.text = this.text.trim();
    this.tempWords = '';
  }
}

export interface Language {
  name: string,
  code: string
}
