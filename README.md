# ♻️ ReCicloApp

O **ReCicloApp** é um aplicativo mobile desenvolvido com **React Native (Expo)** e **TypeScript**, integrado ao **Supabase** para gerenciamento de dados e autenticação, focado em incentivar e facilitar práticas de reciclagem e sustentabilidade.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e ferramentas:

* **[React Native](https://reactnative.dev/)** / **[Expo](https://expo.dev/)** - Framework para desenvolvimento mobile multiplataforma.
* **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática.
* **[Supabase](https://supabase.com/)** - Backend-as-a-Service (BaaS) para banco de dados relacional e autenticação.

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* Gerenciador de pacotes `npm` ou `yarn`
* Aplicativo **Expo Go** instalado no seu smartphone ou um emulador configurado (Android Studio / Xcode).

---

## 📥 Como Rodar o Projeto Localmente

Siga os passos abaixo para clonar e executar o projeto na sua máquina:

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/RecicloApp/reciclo-app.git](https://github.com/RecicloApp/reciclo-app.git)
Entre na pasta do projeto:

Bash
cd reciclo-app
Instale as dependências:

Bash
npm install
# ou
yarn install
Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto (utilizando como base o arquivo de configuração do Supabase) e adicione suas credenciais:

Snippet de código
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase_aqui
Inicie o servidor de desenvolvimento:

Bash
npx expo start
Abra o aplicativo:

Escaneie o QR Code exibido no terminal utilizando o aplicativo Expo Go (no Android) ou a câmera (no iOS).

Pressione a para abrir no emulador Android ou i para o simulador iOS (caso configurados).

📂 Estrutura do Projeto
Plaintext
ReCicloApp/
├── src/
│   ├── components/    # Componentes reutilizáveis de UI
│   ├── screens/       # Telas principais do aplicativo
│   ├── services/      # Conexões e integrações (ex: Supabase)
│   └── types/         # Definições de tipos TypeScript
├── App.tsx            # Ponto de entrada da aplicação
└── app.json           # Configurações do Expo
🤝 Contribuindo
Faça um Fork do projeto.

Crie uma branch para sua feature (git checkout -b feature/MinhaFeature).

Faça ocommit das suas alterações (git commit -m 'Adiciona nova funcionalidade').

Faça o Push para a branch (git push origin feature/MinhaFeature).

Abra um Pull Request.
