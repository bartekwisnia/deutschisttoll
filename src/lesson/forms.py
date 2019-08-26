from django import forms
from .models import Exercise, Lesson


class ExerciseForm(forms.ModelForm):
    class Meta:
        model = Exercise
        exclude = ['dictionary']

    def __init__(self, *args, **kwargs):
        self.words_count = kwargs.pop('words_count')
        super().__init__(*args, **kwargs)
        for word in range(0, self.words_count):
            self.fields['word'+str(word+1)] = forms.CharField(required=False)
            self.fields['translation'+str(word+1)] = forms.CharField(required=False)
            self.fields['word'+str(word+1)].label = 'słowo '+str(word+1)
            self.fields['translation'+str(word+1)].label = 'tłumaczenie '+str(word+1)

    def save(self, commit=True):
        instance = super(ExerciseForm, self).save(commit=False)
        print(self.cleaned_data)
        instance.dictionary = {}
        i = 1
        while 'word'+str(i) in self.cleaned_data:
            word = self.cleaned_data['word'+str(i)]
            translation = self.cleaned_data['translation'+str(i)]
            instance.dictionary[word] = translation
            i += 1
        if commit:
            instance.save()
        return instance


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = '__all__'


# class ExerciseCategoryForm(forms.ModelForm):
#     class Meta:
#         model = ExerciseCategory
#         fields = '__all__'
#
