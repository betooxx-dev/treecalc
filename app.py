from flask import Flask, render_template, jsonify, request, send_from_directory
import ply.lex as lex
import re
import os

app = Flask(__name__)

# Token definitions
tokens = (
    'NUMBER',
    'PLUS',
    'MINUS',
    'TIMES',
    'DIVIDE',
    'LPAREN',
    'RPAREN',
)

# Regular expressions
t_PLUS = r'\+'
t_MINUS = r'-'
t_TIMES = r'\*'
t_DIVIDE = r'/'
t_LPAREN = r'\('
t_RPAREN = r'\)'

def t_NUMBER(t):
    r'\d+(\.\d+)?'
    t.value = float(t.value)
    return t

t_ignore = ' \t'

def t_error(t):
    print(f"Illegal character '{t.value[0]}'")
    t.lexer.skip(1)

# Create lexer
lexer = lex.lex()

# Memory storage
memory = 0

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def tokenize_expression(expression):
    tokens_list = []
    token_count = {'numbers': 0, 'operators': 0}
    
    # Remove spaces and validate expression
    expression = expression.replace(' ', '')
    # Modificamos la expresión regular para aceptar × explícitamente
    if not re.match(r'^[0-9+\-*/×().]+$', expression):
        return None, None
    
    # Reemplazamos × por * antes de tokenizar
    expression = expression.replace('×', '*')
    lexer.input(expression)
    
    while True:
        tok = lexer.token()
        if not tok:
            break
            
        if tok.type == 'NUMBER':
            token_type = "Número entero"
            token_count['numbers'] += 1
            token_value = str(tok.value)
        else:
            token_type = "Operador"
            token_value = tok.value
            if tok.type in ['PLUS', 'MINUS', 'TIMES', 'DIVIDE']:
                token_count['operators'] += 1
                if tok.value == '*':
                    token_value = '×'
                
        tokens_list.append({
            'token': token_value,
            'tipo': token_type
        })
    
    return tokens_list, token_count

def build_tree(expression):
    # Reemplazamos × por * antes de construir el árbol
    expression = expression.replace('×', '*')
    if not re.match(r'^[0-9+\-*/().]+$', expression):
        return None
    
    def find_main_operator(expr):
        parentheses = 0
        for i in range(len(expr)-1, -1, -1):
            if expr[i] == ')':
                parentheses += 1
            elif expr[i] == '(':
                parentheses -= 1
            elif parentheses == 0 and expr[i] in '+-*/':
                return i
        return -1

    while expression.startswith('(') and expression.endswith(')'):
        expression = expression[1:-1]

    op_index = find_main_operator(expression)
    
    if op_index == -1:
        try:
            return Node(float(expression))
        except ValueError:
            return None

    # Convertimos * de vuelta a × para la visualización
    operator = expression[op_index]
    if operator == '*':
        operator = '×'
    
    root = Node(operator)
    root.left = build_tree(expression[:op_index])
    root.right = build_tree(expression[op_index + 1:])
    
    return root

def tree_to_dict(node):
    if node is None:
        return None
    return {
        'value': str(node.value),
        'children': [
            tree_to_dict(node.left),
            tree_to_dict(node.right)
        ] if (node.left or node.right) else None
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('templates', filename)

@app.route('/calculate', methods=['POST'])
def calculate():
    expression = request.json.get('expression', '')
    try:
        # Convert multiply symbol for evaluation
        eval_expression = expression.replace('×', '*')
        
        # Tokenize and analyze
        tokens_list, token_count = tokenize_expression(expression)
        if tokens_list is None:
            return jsonify({'error': 'Invalid expression'}), 400
            
        # Build tree
        tree = build_tree(expression)
        if tree is None:
            return jsonify({'error': 'Invalid expression'}), 400
            
        tree_dict = tree_to_dict(tree)
        
        # Calculate result
        result = eval(eval_expression)
        
        return jsonify({
            'result': result,
            'tree': tree_dict,
            'tokens': tokens_list,
            'token_count': token_count
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Invalid expression'}), 400

@app.route('/memory', methods=['POST'])
def memory_operation():
    global memory
    operation = request.json.get('operation')
    value = request.json.get('value', 0)
    
    try:
        if operation == 'MS':
            memory = float(value)
            return jsonify({'result': memory})
        elif operation == 'MR':
            return jsonify({'result': memory})
        elif operation == 'MC':
            memory = 0
            return jsonify({'result': memory})
        else:
            return jsonify({'error': 'Invalid operation'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Invalid operation'}), 400

if __name__ == '__main__':
    app.run(debug=True)