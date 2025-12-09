from django.shortcuts import render

# This function handles the request for the homepage
def index(request):
    # This tells Django: "Go find 'index.html' in the templates folder and send it back"
    return render(request, 'index.html')