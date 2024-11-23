# TreeCalc 🌳🔢
![image](https://github.com/user-attachments/assets/8597da5f-defe-4298-ab40-a504d825b3ac)

## Descripción
TreeCalc es una aplicación web moderna que combina una calculadora interactiva con visualización de árboles sintácticos y análisis de tokens en tiempo real. Utilizando gramática libre de contexto, parsea expresiones matemáticas y genera una representación visual del árbol de operaciones y sus tokens, facilitando la comprensión de la precedencia y estructura de las operaciones matemáticas.

## Características ✨
- Interfaz de calculadora moderna y responsive
- Visualización de árboles sintácticos en tiempo real
- Análisis y visualización de tokens
- Soporte para operaciones básicas (+, -, *, /)
- Manejo de paréntesis para control de precedencia
- Funciones de memoria (MS, MR, MC)
- Animaciones fluidas en la interfaz y generación de árboles
- Diseño adaptable a diferentes tamaños de pantalla
- Contador de tokens (números y operadores)

## Tecnologías Utilizadas 🛠️
- **Backend**:
  - Python 3.x
  - Flask
  - PLY (Python Lex-Yacc)
  - Gramática Libre de Contexto para parsing
- **Frontend**:
  - HTML5
  - CSS3 con animaciones
  - JavaScript
  - D3.js para visualización de árboles

## Instalación 🚀
1. Clona el repositorio:
```bash
git clone https://github.com/betooxx-dev/treecalc.git
cd treecalc
```

2. Crea y activa un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instala las dependencias:
```bash
pip install Flask ply
```

4. Ejecuta la aplicación:
```bash
python app.py
```

5. Abre tu navegador y visita:
```
http://localhost:5000
```

## Estructura del Proyecto 📁
```
treecalc/
├── app.py             # Aplicación principal Flask y lexer
├── templates/
│   ├── index.html    # Plantilla principal
│   ├── index.css     # Estilos
│   └── index.js      # Lógica del cliente
└── README.md         # Documentación
```

## Uso 💡
1. Ingresa una expresión matemática usando la calculadora
2. Los resultados se muestran instantáneamente
3. El árbol sintáctico se genera y anima en tiempo real
4. La tabla de tokens muestra el análisis de la expresión
5. Usa las funciones de memoria:
   - MS: Guarda el número actual en memoria
   - MR: Recupera el número guardado
   - MC: Limpia la memoria
6. La visualización se adapta automáticamente al tamaño de la ventana

## Funciones de Memoria 📋
- **MS (Memory Store)**: Guarda el número actual en memoria
- **MR (Memory Recall)**: Inserta el número guardado en la operación actual
- **MC (Memory Clear)**: Borra el número guardado en memoria

## Ejemplos de Expresiones 📝
- Operaciones básicas: `3 + 4 * 2`
- Con paréntesis: `(3 + 4) * 2`
- Operaciones múltiples: `5 * (3 + 2) / 4`
- Usando memoria: 
  1. Calcula `5 * 3`
  2. Guarda el resultado con MS
  3. Nueva operación: `10 +` 
  4. Usa MR para agregar el número guardado

## Análisis de Tokens 🔍
La aplicación muestra en tiempo real:
- Lista de tokens identificados
- Tipo de cada token (número u operador)
- Conteo total de números y operadores

## Visualización del Árbol 🌳
- Representación jerárquica de la expresión
- Nodos interactivos con efectos hover
- Animaciones suaves en la construcción
- Actualización dinámica con cada cambio
