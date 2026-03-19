import { Component } from '@angular/core';
import { Footer } from "./component/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Header } from "./component/header/header";

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Footer, RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}