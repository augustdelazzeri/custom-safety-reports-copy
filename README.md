# UpKeep Safety Prototype

## Visão Geral do Projeto
Este repositório é um **protótipo front-end** baseado no UpKeep Safety. Ele foi criado com o objetivo de facilitar a ideação, experimentação e validação de novas funcionalidades e conceitos de UX/UI antes de sua implementação no produto oficial.

**Atenção:** As telas e fluxos presentes aqui foram gerados com base no estado do produto em Fevereiro de 2026. Eles podem estar desatualizados em relação ao sistema em produção ou apresentar algumas pequenas incoerências de navegação. No entanto, eles fornecem uma fundação excelente para prototipar cenários futuros.

---

## 🤖 Diretrizes para IA e Agentes de Código (AI Agent Guidelines)

Se você é um assistente de inteligência artificial trabalhando neste repositório, leia estas regras atentamente antes de sugerir ou implementar alterações:

### 1. Arquitetura puramente Front-end (No Backend)
* **NÃO EXISTE BACK-END OU BANCO DE DADOS.**
* **Persistência de Dados:** Qualquer novo dado criado, modificado ou deletado pelo usuário no protótipo DEVE ser armazenado estritamente no cliente. Utilize o `localStorage`, `sessionStorage` ou gerencie o estado global da aplicação via React Context API (existem vários provedores já configurados na pasta `src/contexts/`).
* **Mock de APIs:** Nunca implemente requisições HTTP reais (`fetch`, `axios`) para salvar ou buscar dados de APIs. Toda a lógica de CRUD deve ser simulada localmente nas funções do Context.

### 2. Padrões de Desenvolvimento e Expansão
* **Compartilhamento de Estado:** Para dados que precisam persistir durante a navegação entre rotas, crie um novo `Context` (ou expanda um existente) e garanta que ele injete os dados no componente raiz (através do `src/components/Providers.tsx`).
* **Componentização e Organização:**
  * Rotas e páginas: `app/` (utilizando Next.js App Router).
  * Componentes de UI: `src/components/` (sempre que possível, generalize modais, dropdowns e inputs).
  * Lógica reaproveitável: `src/hooks/`.
  * Tipagens e dados iniciais mockados: `src/schemas/` e `src/data/` ou `src/samples/`.
* **Estilização (Tailwind CSS):** Mantenha a coesão visual. Utilize as classes do Tailwind disponíveis e tente reutilizar a mesma paleta de cores e padrões de espaçamento das telas existentes.
* **Escopo:** O objetivo deste projeto é demonstrar a Experiência do Usuário (UX). Não adicione complexidade técnica desnecessária (como validações de segurança complexas, JWT, SSR intrincado, etc). Mantenha o código focado no fluxo da interface.

### 3. Executando o Projeto
O projeto utiliza Next.js (App Router). Para rodar localmente:
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## Informações para Designers e Product Managers
* Como este é um ambiente de protótipo que roda totalmente no seu navegador, você tem um "sandbox" seguro. Se a aplicação entrar em um estado indesejado ou se os dados ficarem baguçados, basta limpar os dados do site (limpar localStorage/Cache) ou utilizar os botões de "Reset" espalhados pela interface.
* **Integrando com IA:** Ao pedir para o Cursor (ou outra IA) desenvolver uma nova tela a partir do seu Figma, referencie as diretrizes deste README. Lembre a IA de usar os `Contexts` locais para manter o fluxo funcional, de forma que você possa clicar nos protótipos como se fossem a aplicação real.
