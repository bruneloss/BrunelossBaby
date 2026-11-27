/* Configuração do app.
   - CONFIG_FIREBASE: o banco gratuito que deixa o casal editar junto (vem do console do Firebase).
     Esses dados não são senha: quem protege a casa é o código secreto do convite e as regras do Firestore.
   - CONFIG_AVISOS: servidor de avisos na Cloudflare (notificações do app Android).
   - CONFIG_DOWNLOAD: página para baixar o app Android (APK). */

window.CONFIG_AVISOS = 'https://brunelossbaby-cantinho.pages.dev/api';
window.CONFIG_DOWNLOAD = 'https://brunelossbaby-cantinho.pages.dev/';

window.CONFIG_FIREBASE = {
  apiKey: "AIzaSyAmioMD1sgDqYZNKYC51RcRrkOhf4iF_Bo",
  authDomain: "nosso-cantinho-e4ca8.firebaseapp.com",
  projectId: "nosso-cantinho-e4ca8",
  storageBucket: "nosso-cantinho-e4ca8.firebasestorage.app",
  messagingSenderId: "500175030321",
  appId: "1:500175030321:web:42ccf4d1bbe375c539ed10",
};
