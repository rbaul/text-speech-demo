import {Component, OnInit} from '@angular/core';
import {Language, VoiceRecognitionService} from "../shared/voice-recognition.service";
import {SpeechService} from "../shared/speech.service";
import {Observable} from "rxjs";
import {getUserLocale, getUserLocales} from 'get-user-locale';

@Component({
  selector: 'app-echo-area',
  templateUrl: './echo-area.component.html',
  styleUrls: ['./echo-area.component.css']
})
export class EchoAreaComponent implements OnInit {

  text: string = '';
  userLocale: string = '';

  langSupport: Language[] = [];
  selectedLanguageRecognizerValue!: Language;

  voices$!: Observable<SpeechSynthesisVoice[]>;
  isPlayback$!: Observable<boolean>;
  isPlayback: boolean = false;
  selectedVoiceValue!: SpeechSynthesisVoice;


  public isUserSpeaking: boolean = false;

  constructor(private voiceRecognition: VoiceRecognitionService,
              private speechService: SpeechService) {
  }

  ngOnInit(): void {
    // window.navigator.languages window.navigator.language
    this.userLocale = getUserLocale();
    this.initVoiceInput();
    this.initSpeech();
  }

  initSpeech(): void {
    this.voices$ = this.speechService.voices$;
    this.voices$.subscribe(value => {
      this.selectedVoiceValue = value[0];
    });
    this.isPlayback$ = this.speechService.isPlayback$;
    this.isPlayback$.subscribe(value => {
      this.isPlayback = value;
    })
  }

  /**
   * @description Function to stop recording.
   */
  stopRecording() {
    this.voiceRecognition.stop();
    this.isUserSpeaking = false;
  }

  /**
   * @description Function for initializing voice input so user can chat with machine.
   */
  initVoiceInput() {
    this.langSupport = this.voiceRecognition.langSupport;
    this.selectedLanguageRecognizerValue = this.langSupport[0];
    // Subscription for initializing and this will call when user stopped speaking.
    this.voiceRecognition.init().subscribe(() => {
      // User has stopped recording
      // Do whatever when mic finished listening
    });

    // Subscription to detect user input from voice to text.
    this.voiceRecognition.speechInput().subscribe((input) => {
      // Set voice text output to
      this.text = input;
    });
  }

  /**
   * @description Function to enable voice input.
   */
  startRecording() {
    this.isUserSpeaking = true;
    this.voiceRecognition.changeLanguage(this.selectedLanguageRecognizerValue.code);
    this.voiceRecognition.start();
  }

  stopPlayback(): void {
    this.speechService.stopPlayback();
  }

  startPlayback(): void {
    this.speechService.startPlayback(this.text, this.selectedVoiceValue);
  }
}
