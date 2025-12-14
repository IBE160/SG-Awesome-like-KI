from flask import Flask, request, jsonify
import requests
import PyPDF2
import io
import os

app = Flask(__name__)

# Load environment variables (if any)
# from dotenv import load_dotenv
# load_dotenv()

@app.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    try:
        data = request.get_json()
        signed_url = data.get('signedUrl')
        study_material_id = data.get('studyMaterialId')

        if not signed_url:
            return jsonify({"error": "Missing signedUrl"}), 400

        # Fetch PDF from the signed URL
        pdf_response = requests.get(signed_url)
        pdf_response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

        # Use PyPDF2 to extract text
        pdf_file = io.BytesIO(pdf_response.content)
        reader = PyPDF2.PdfReader(pdf_file)
        
        extracted_text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            extracted_text += page.extract_text() or "" # extract_text can return None

        if not extracted_text.strip():
            return jsonify({"error": "No text extracted from the PDF."}), 422

        return jsonify({
            "studyMaterialId": study_material_id,
            "extractedText": extracted_text.strip(),
            "message": "PDF parsed successfully."
        }), 200

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error fetching PDF from signed URL: {e}")
        return jsonify({"error": f"Failed to fetch PDF: {e}"}), 500
    except PyPDF2.errors.PdfReadError as e:
        app.logger.error(f"Error reading PDF file: {e}")
        return jsonify({"error": "The provided file does not appear to be a valid PDF."}), 415
    except Exception as e:
        app.logger.error(f"Internal Server Error during PDF processing: {e}")
        return jsonify({"error": f"Internal Server Error during PDF processing: {e}"}), 500

if __name__ == '__main__':
    # For development, you might want to run it on a specific port
    # In production, a WSGI server like Gunicorn would be used
    app.run(host='0.0.0.0', port=5000)