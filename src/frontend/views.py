from django.shortcuts import render
from django.urls import reverse
from django.shortcuts import redirect

# Create your views here.


def index(request):
    if request.user.is_authenticated:
        return render(request, 'frontend/index.html')
    else:
        return render(request, 'frontend/index_pub.html')
        # return redirect(reverse('login'))
