from django.db import models

class LearningRecord(models.Model):
    title = models.CharField(max_length=255)

    time_spent = models.FloatField()          # Ts
    concept_links = models.FloatField()       # Cl
    knowledge_gaps = models.FloatField()      # Kg
    research_questions = models.FloatField()  # Rq

    learning_efficiency = models.FloatField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.knowledge_gaps > 0 and self.research_questions > 0:
            self.learning_efficiency = (
                self.time_spent * self.concept_links
            ) / (self.knowledge_gaps * self.research_questions)
        else:
            self.learning_efficiency = None

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title