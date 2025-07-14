from flask import Flask, request, jsonify
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Initialize Flask app
app = Flask(__name__)

# Enable CORS (if not done already)
from flask_cors import CORS
CORS(app)

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

@app.route('/process', methods=['POST'])
def process_command():
    try:
        data = request.get_json(force=True, silent=True)
        if not data or 'text' not in data:
            return jsonify({'error': 'Invalid input format'}), 400
        text = data['text']

        # NLTK processing
        tokens = word_tokenize(text.lower())
        stopwords_list = stopwords.words('english')
        filtered_tokens = [word for word in tokens if word not in stopwords_list]

        if 'play' in filtered_tokens or 'find' in filtered_tokens or 'show' in filtered_tokens:
            query = ' '.join([word for word in filtered_tokens if word not in ['play', 'find', 'show']])
            command = f"search {query} on youtube"
        else:
            command = text

        return jsonify({'command': command})

    except Exception as e:
        print(f"Error processing request: {e}")  # Log the error for debugging
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
