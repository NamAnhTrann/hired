import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { DashboardPage } from './dashboard-page/dashboard-page';
import { SignupPage } from './signup-page/signup-page';
import { LoginPage } from './login-page/login-page';
import { MarketplacePage } from './marketplace-page/marketplace-page';
import { ChatPage } from './chat-page/chat-page';
import { AboutUsPage } from './about-us-page/about-us-page';
import { ContactPage } from './contact-page/contact-page';
import { ForgotPasswordPage } from './forgot-password-page/forgot-password-page';

export const routes: Routes = [
    {path:"", component:Homepage},
    {path:"dashboard-page", component:DashboardPage},
    {path:"signup-page", component:SignupPage},
    {path:"login-page", component:LoginPage},
    {path:"marketplace-page", component:MarketplacePage},
    {path:"chat-page", component:ChatPage},
    {path:"aboutUs-page", component:AboutUsPage},
    {path:"contact-page", component:ContactPage},
    {path:"forgotPassword-page", component:ForgotPasswordPage},






    
];
