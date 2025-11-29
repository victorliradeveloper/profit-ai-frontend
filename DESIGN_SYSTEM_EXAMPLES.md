# 🎨 Exemplos de Uso do Design System

Este arquivo contém exemplos práticos de como usar o Design System do Flashdeck AI.

## 🎯 Componentes Prontos para Uso

### Botões

```html
<!-- Botão Primário -->
<button class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary">
  Botão Primário
</button>

<!-- Botão Secundário -->
<button class="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-secondary">
  Botão Secundário
</button>

<!-- Botão Outline -->
<button class="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
  Botão Outline
</button>

<!-- Botão com Gradiente -->
<button class="bg-gradient-primary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary-lg">
  Botão Gradiente
</button>
```

### Cards

```html
<!-- Card Básico -->
<div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
  <h3 class="text-xl font-bold text-neutral-800 mb-2">Título do Card</h3>
  <p class="text-neutral-600">Descrição do card com texto explicativo.</p>
</div>

<!-- Card com Ícone -->
<div class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  <div class="text-4xl mb-4">🧠</div>
  <h3 class="text-xl font-bold text-primary-600 mb-2">IA Inteligente</h3>
  <p class="text-neutral-600">Descrição do recurso</p>
</div>

<!-- Card com Gradiente -->
<div class="bg-gradient-primary text-white rounded-xl shadow-primary-lg p-6">
  <h3 class="text-xl font-bold mb-2">Card Premium</h3>
  <p class="opacity-90">Conteúdo especial</p>
</div>
```

### Formulários

```html
<!-- Input Padrão -->
<div class="mb-5">
  <label class="block mb-2 text-neutral-700 font-medium">Email:</label>
  <input 
    type="email" 
    class="w-full py-3 px-4 border-2 border-neutral-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
    placeholder="Digite seu email"
  >
</div>

<!-- Input com Erro -->
<div class="mb-5">
  <label class="block mb-2 text-error-600 font-medium">Senha:</label>
  <input 
    type="password" 
    class="w-full py-3 px-4 border-2 border-error-300 rounded-lg text-base focus:outline-none focus:border-error-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    placeholder="Digite sua senha"
  >
  <p class="mt-1 text-sm text-error-600">Senha muito curta</p>
</div>

<!-- Textarea -->
<div class="mb-5">
  <label class="block mb-2 text-neutral-700 font-medium">Mensagem:</label>
  <textarea 
    class="w-full py-3 px-4 border-2 border-neutral-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
    rows="4"
    placeholder="Digite sua mensagem"
  ></textarea>
</div>
```

### Badges e Tags

```html
<!-- Badge Primário -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
  Novo
</span>

<!-- Badge Secundário -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700">
  Popular
</span>

<!-- Badge Success -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-700">
  Ativo
</span>

<!-- Badge Warning -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-700">
  Atenção
</span>

<!-- Badge Error -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-100 text-error-700">
  Erro
</span>
```

### Alerts

```html
<!-- Alert Success -->
<div class="bg-success-50 border-l-4 border-success-500 text-success-700 p-4 rounded-lg mb-4">
  <p class="font-medium">Sucesso!</p>
  <p class="text-sm">Operação realizada com sucesso.</p>
</div>

<!-- Alert Warning -->
<div class="bg-warning-50 border-l-4 border-warning-500 text-warning-700 p-4 rounded-lg mb-4">
  <p class="font-medium">Atenção!</p>
  <p class="text-sm">Verifique os dados informados.</p>
</div>

<!-- Alert Error -->
<div class="bg-error-50 border-l-4 border-error-500 text-error-700 p-4 rounded-lg mb-4">
  <p class="font-medium">Erro!</p>
  <p class="text-sm">Ocorreu um erro ao processar sua solicitação.</p>
</div>
```

### Navegação

```html
<!-- Navbar -->
<nav class="bg-gradient-primary text-white shadow-lg">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center h-20">
      <h1 class="text-2xl font-bold">Flashdeck AI</h1>
      <div class="flex gap-4">
        <a href="#" class="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
          Início
        </a>
        <a href="#" class="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
          Sobre
        </a>
        <a href="#" class="px-4 py-2 rounded-lg bg-white/20 font-semibold">
          Login
        </a>
      </div>
    </div>
  </div>
</nav>

<!-- Breadcrumbs -->
<nav class="flex mb-4">
  <a href="#" class="text-primary-500 hover:text-primary-600">Home</a>
  <span class="mx-2 text-neutral-400">/</span>
  <a href="#" class="text-primary-500 hover:text-primary-600">Categoria</a>
  <span class="mx-2 text-neutral-400">/</span>
  <span class="text-neutral-600">Página Atual</span>
</nav>
```

### Loading States

```html
<!-- Spinner -->
<div class="flex justify-center items-center">
  <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
</div>

<!-- Skeleton Loader -->
<div class="animate-pulse">
  <div class="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
</div>
```

### Modals

```html
<!-- Modal Overlay -->
<div class="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-100">
  <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
    <h2 class="text-2xl font-bold text-neutral-800 mb-4">Título do Modal</h2>
    <p class="text-neutral-600 mb-6">Conteúdo do modal</p>
    <div class="flex gap-4 justify-end">
      <button class="px-4 py-2 text-neutral-600 hover:text-neutral-800">Cancelar</button>
      <button class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Confirmar</button>
    </div>
  </div>
</div>
```

### Hero Section

```html
<section class="bg-gradient-hero text-white py-20">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
      Bem-vindo ao Flashdeck AI
    </h1>
    <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
      Aprenda inglês com flashcards inteligentes gerados por IA
    </p>
    <div class="flex gap-4 justify-center flex-wrap">
      <button class="bg-white text-primary-500 hover:bg-neutral-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        Começar Agora
      </button>
      <button class="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
        Saiba Mais
      </button>
    </div>
  </div>
</section>
```

### Footer

```html
<footer class="bg-gradient-footer text-neutral-100 mt-auto shadow-lg">
  <div class="container mx-auto px-4 py-8">
    <div class="grid md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-xl font-bold text-accent-400 mb-4">Flashdeck AI</h3>
        <p class="text-neutral-300 text-sm">
          Aprenda inglês com flashcards inteligentes gerados por IA.
        </p>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Links</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="text-neutral-300 hover:text-accent-400 transition-colors">Sobre</a></li>
          <li><a href="#" class="text-neutral-300 hover:text-accent-400 transition-colors">Contato</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-neutral-700 mt-8 pt-8 text-center text-sm text-neutral-400">
      © 2025 Flashdeck AI. Todos os direitos reservados.
    </div>
  </div>
</footer>
```

---

## 🎨 Paleta de Cores em Uso

### Cores Principais

- **Primary (Indigo)**: `#667eea` - Use para elementos principais, CTAs
- **Secondary (Purple)**: `#9333ea` - Use para elementos secundários
- **Accent (Blue)**: `#2563eb` - Use para destaques e links

### Cores Neutras

- **Neutral-800**: Textos principais
- **Neutral-600**: Textos secundários
- **Neutral-200**: Bordas e divisores
- **Neutral-100**: Backgrounds claros

---

## 📱 Responsividade

Todos os componentes são responsivos por padrão. Use os breakpoints:

```html
<!-- Mobile first -->
<div class="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>

<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

---

## ✨ Animações

```html
<!-- Fade In -->
<div class="animate-fade-in">Aparece suavemente</div>

<!-- Hover com elevação -->
<div class="hover:-translate-y-1 transition-transform duration-200">
  Eleva ao passar o mouse
</div>

<!-- Scale on hover -->
<div class="hover:scale-105 transition-transform duration-200">
  Aumenta ao passar o mouse
</div>
```

---

**Dica:** Sempre use as classes do design system ao invés de valores hardcoded para manter a consistência visual!

