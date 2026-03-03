# Learning_Efficiency2_0

# Learning Record Model Analysis

## Formula
```
Learning Efficiency = (Time Spent × Concept Links) / (Knowledge Gaps × Research Questions)
```

## Verification Against Data

| | Session 1 (id:1) | Session 2 (id:2) |
|---|---|---|
| Time Spent | 6.0 hrs | 1.0 hr |
| Concept Links | 4 | 4 |
| Knowledge Gaps | 3 | 3 |
| Research Questions | 1 | 1 |
| Numerator (Ts × Cl) | 6 × 4 = 24 | 1 × 4 = 4 |
| Denominator (Kg × Rq) | 3 × 1 = 3 | 3 × 1 = 3 |
| **Learning Efficiency** | **24/3 = 8.0 ✅** | **4/3 = 1.33 ✅** |

## What The Formula Means

- **Numerator** — productive output: time invested multiplied by concepts connected
- **Denominator** — friction: unresolved gaps multiplied by open questions
- **Higher score** → more time + more connections, relative to unresolved friction
- **Lower score** → less time or fewer connections, or more unresolved gaps

## Design Consideration

`time_spent` sits in the **numerator**, meaning more hours always increases efficiency.
This may not reflect true learning quality — struggling for 6 hours scores higher than
mastering something in 1 hour.

An alternative formula that rewards doing more with less time:
```
efficiency = concept_links / (time_spent × knowledge_gaps × research_questions)
```

## Django Model Save Logic
```python
def save(self, *args, **kwargs):
    if self.knowledge_gaps > 0 and self.research_questions > 0:
        self.learning_efficiency = (
            self.time_spent * self.concept_links
        ) / (self.knowledge_gaps * self.research_questions)
    else:
        self.learning_efficiency = None
    super().save(*args, **kwargs)
```

The guard clause `if knowledge_gaps > 0 and research_questions > 0` correctly prevents
division by zero, returning `None` when either denominator value is missing.
 
