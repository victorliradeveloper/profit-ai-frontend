# 🎨 Flashdeck AI Design System

Sistema de design completo para o projeto Flashdeck AI, baseado em Tailwind CSS.

## 📋 Índice

- [Cores](#cores)
- [Tipografia](#tipografia)
- [Espaçamento](#espaçamento)
- [Sombras](#sombras)
- [Bordas](#bordas)
- [Gradientes](#gradientes)
- [Animações](#animações)
- [Componentes](#componentes)

---

## 🎨 Cores

### Cores Primárias

A cor primária é um **indigo** que representa a identidade visual principal do Flashdeck AI.

```html
<!-- Uso básico -->
<div class="bg-primary-500 text-white">Conteúdo</div>
<div class="text-primary-600">Texto</div>
<div class="border-primary-400">Borda</div>
```

**Paleta completa:**
- `primary-50` - Mais claro
- `primary-100` - Muito claro
- `primary-200` - Claro
- `primary-300` - Médio claro
- `primary-400` - Médio
- `primary-500` - **Cor principal** (#667eea)
- `primary-600` - Médio escuro
- `primary-700` - Escuro
- `primary-800` - Muito escuro
- `primary-900` - Mais escuro
- `primary-950` - Escuro profundo

### Cores Secundárias

Cor **purple** usada para elementos secundários e destaques.

```html
<div class="bg-secondary-500 text-white">Conteúdo secundário</div>
```

**Paleta completa:**
- `secondary-50` até `secondary-950` (mesma estrutura da primária)
- **Cor principal:** `secondary-600` (#9333ea)

### Cores de Acento

Cor **azul** para elementos de destaque e call-to-actions.

```html
<div class="bg-accent-500 text-white">Destaque</div>
```

**Paleta completa:**
- `accent-50` até `accent-950`
- **Cor principal:** `accent-600` (#2563eb)

### Cores Neutras

Escala de cinzas para textos, backgrounds e elementos neutros.

```html
<div class="bg-neutral-100 text-neutral-800">Conteúdo neutro</div>
```

**Paleta completa:**
- `neutral-50` até `neutral-950`

### Cores de Status

Cores semânticas para feedback e estados.

#### Success (Verde)
```html
<div class="bg-success-500 text-white">Sucesso</div>
```

#### Warning (Amarelo/Laranja)
```html
<div class="bg-warning-500 text-white">Aviso</div>
```

#### Error (Vermelho)
```html
<div class="bg-error-500 text-white">Erro</div>
```

### Cores de Background

```html
<div class="bg-background-light">Background claro</div>
<div class="bg-background-dark text-white">Background escuro</div>
<div class="bg-background-gray">Background cinza</div>
```

---

## 📝 Tipografia

### Fontes

- **Fonte principal:** Poppins (sans-serif)
- **Fonte display:** Poppins (para títulos)

```html
<h1 class="font-display text-4xl font-bold">Título Display</h1>
<p class="font-sans text-base">Texto padrão</p>
```

### Tamanhos de Fonte

```html
<p class="text-xs">Extra pequeno</p>
<p class="text-sm">Pequeno</p>
<p class="text-base">Base (padrão)</p>
<p class="text-lg">Grande</p>
<p class="text-xl">Extra grande</p>
<h2 class="text-2xl">2XL</h2>
<h1 class="text-3xl">3XL</h1>
<h1 class="text-4xl">4XL</h1>
<h1 class="text-5xl">5XL</h1>
```

### Pesos de Fonte

```html
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Médio (500)</p>
<p class="font-semibold">Semi-negrito (600)</p>
<p class="font-bold">Negrito (700)</p>
```

---

## 📏 Espaçamento

### Padding e Margin

Use as classes padrão do Tailwind com espaçamentos customizados adicionais:

```html
<!-- Espaçamentos padrão -->
<div class="p-4">Padding 1rem</div>
<div class="m-8">Margin 2rem</div>

<!-- Espaçamentos customizados -->
<div class="p-18">Padding 4.5rem</div>
<div class="m-88">Margin 22rem</div>
```

### Espaçamento Padrão

- `0` = 0px
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `8` = 2rem (32px)
- `16` = 4rem (64px)

---

## 🌑 Sombras

### Sombras Padrão

```html
<div class="shadow-sm">Sombra pequena</div>
<div class="shadow">Sombra padrão</div>
<div class="shadow-md">Sombra média</div>
<div class="shadow-lg">Sombra grande</div>
<div class="shadow-xl">Sombra extra grande</div>
<div class="shadow-2xl">Sombra 2XL</div>
```

### Sombras Temáticas

```html
<div class="shadow-primary">Sombra com cor primária</div>
<div class="shadow-primary-lg">Sombra primária grande</div>
<div class="shadow-secondary">Sombra secundária</div>
<div class="shadow-accent">Sombra de destaque</div>
```

---

## 🔲 Bordas

### Border Radius

```html
<div class="rounded-none">Sem borda</div>
<div class="rounded-sm">Borda pequena</div>
<div class="rounded">Borda padrão</div>
<div class="rounded-md">Borda média</div>
<div class="rounded-lg">Borda grande</div>
<div class="rounded-xl">Borda XL</div>
<div class="rounded-2xl">Borda 2XL</div>
<div class="rounded-3xl">Borda 3XL</div>
<div class="rounded-full">Borda completa (círculo)</div>
```

---

## 🌈 Gradientes

### Gradientes Pré-definidos

```html
<!-- Gradiente primário (indigo → purple) -->
<div class="bg-gradient-primary">Conteúdo</div>

<!-- Gradiente secundário -->
<div class="bg-gradient-secondary">Conteúdo</div>

<!-- Gradiente de destaque -->
<div class="bg-gradient-accent">Conteúdo</div>

<!-- Gradiente hero -->
<div class="bg-gradient-hero">Hero section</div>

<!-- Gradiente footer -->
<div class="bg-gradient-footer">Footer</div>
```

### Gradientes Customizados

```html
<!-- Usando classes Tailwind -->
<div class="bg-gradient-to-br from-primary-500 to-secondary-600">
  Gradiente customizado
</div>
```

---

## ✨ Animações

### Animações Disponíveis

```html
<!-- Fade In -->
<div class="animate-fade-in">Aparece suavemente</div>

<!-- Fade Out -->
<div class="animate-fade-out">Desaparece suavemente</div>

<!-- Slide Up -->
<div class="animate-slide-up">Desliza para cima</div>

<!-- Slide Down -->
<div class="animate-slide-down">Desliza para baixo</div>

<!-- Scale In -->
<div class="animate-scale-in">Escala para dentro</div>

<!-- Bounce Sutil -->
<div class="animate-bounce-subtle">Bounce suave</div>
```

### Transições

```html
<!-- Transição padrão -->
<div class="transition-all duration-300">Transição suave</div>

<!-- Transição rápida -->
<div class="transition-all duration-200">Transição rápida</div>

<!-- Transição lenta -->
<div class="transition-all duration-500">Transição lenta</div>
```

---

## 🧩 Componentes

### Botões

#### Botão Primário
```html
<button class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary">
  Botão Primário
</button>
```

#### Botão Secundário
```html
<button class="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-secondary">
  Botão Secundário
</button>
```

#### Botão Outline
```html
<button class="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
  Botão Outline
</button>
```

### Cards

```html
<div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
  <h3 class="text-xl font-bold text-neutral-800 mb-2">Título do Card</h3>
  <p class="text-neutral-600">Conteúdo do card</p>
</div>
```

### Inputs

```html
<input 
  type="text" 
  class="w-full py-3 px-4 border-2 border-neutral-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
  placeholder="Digite aqui..."
>
```

### Badges

```html
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
  Badge
</span>
```

---

## 📱 Breakpoints (Responsividade)

```html
<!-- Mobile first -->
<div class="text-sm md:text-base lg:text-lg xl:text-xl">
  Texto responsivo
</div>

<!-- Esconder em mobile -->
<div class="hidden md:block">Visível apenas em desktop</div>

<!-- Mostrar apenas em mobile -->
<div class="block md:hidden">Visível apenas em mobile</div>
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎯 Guia de Uso

### Hierarquia de Cores

1. **Primária** (`primary-*`) - Use para elementos principais, CTAs, links
2. **Secundária** (`secondary-*`) - Use para elementos secundários, destaques alternativos
3. **Acento** (`accent-*`) - Use para elementos de destaque, informações importantes
4. **Neutras** (`neutral-*`) - Use para textos, backgrounds, bordas

### Exemplo de Página

```html
<!-- Header com gradiente primário -->
<header class="bg-gradient-primary text-white shadow-lg">
  <nav class="container mx-auto px-4 py-4">
    <h1 class="text-2xl font-bold">Flashdeck AI</h1>
  </nav>
</header>

<!-- Hero Section -->
<section class="bg-gradient-hero text-white py-20">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-5xl font-bold mb-4">Bem-vindo</h2>
    <button class="bg-white text-primary-500 hover:bg-neutral-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:-translate-y-0.5">
      Começar
    </button>
  </div>
</section>

<!-- Cards -->
<section class="bg-background-gray py-16">
  <div class="container mx-auto px-4 grid md:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="text-xl font-bold text-primary-600 mb-2">Card 1</h3>
      <p class="text-neutral-600">Conteúdo</p>
    </div>
  </div>
</section>
```

---

## 📚 Recursos Adicionais

- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Heroicons](https://heroicons.com/) - Ícones recomendados

---

**Última atualização:** 2025

