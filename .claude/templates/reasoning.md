# Template : Raisonnement / Décision complexe
# Séquence : /compact → /model opus → réponse reçue → /model sonnet → /compact
# Usage : une seule question précise par session Opus

---

## En-tête de prompt à copier-coller

```
PROBLÈME  : {description précise en 2 à 4 phrases — cause connue, symptôme observé}

CONTEXTE  :
- Ce qui est connu      : {faits établis, état actuel du système ou du projet}
- Ce qui a été essayé   : {tentatives précédentes et leurs résultats}
- Contraintes réelles   : {temps, budget, ressources, compatibilités, performances cibles}
- Contraintes terrain   : {infrastructure, connectivité, contexte local si applicable}

SOURCES   :
# Maximum 3 fichiers ou documents — lire UNIQUEMENT ceux-ci
- {fichier ou extrait 1 — rôle en 5 mots}
- {fichier ou extrait 2 — rôle en 5 mots}
- {fichier ou extrait 3 — rôle en 5 mots}

QUESTION  :
{Une seule question, précise et bien formulée, à laquelle une décision est attendue.}
# Pas "améliore tout" — une décision à prendre

FORMAT DE RÉPONSE ATTENDU :
1. Faisabilité et risques identifiés
2. Options possibles — avantages et inconvénients pour chacune
3. Recommandation motivée (pourquoi cette option et pas une autre)
4. Points de vigilance, désaccords ou incertitudes résiduelles
5. Prochaine action concrète — une seule, soumise à validation humaine
```

> Claude ne valide pas systématiquement.
> Si une incohérence ou un risque est détecté, il le signale avant de continuer.

---

## Checklist avant d'envoyer ce prompt

- [ ] /compact exécuté pour nettoyer le contexte
- [ ] /model opus activé
- [ ] La question est formulée en une seule phrase
- [ ] Maximum 3 sources listées
- [ ] Les contraintes réelles sont mentionnées explicitement
- [ ] Le contexte terrain est précisé si la solution a un impact opérationnel

## Checklist après la réponse

- [ ] Réponse lue entièrement avant toute action
- [ ] Recommandation validée explicitement ("ok, on part sur cette option")
- [ ] /model sonnet activé immédiatement
- [ ] /compact exécuté pour nettoyer le contexte Opus
- [ ] Passer au template [CODE], [DOC] ou [SPEC] pour implémenter

---

## Exemples de PROBLÈME selon domaine

| Domaine       | Exemple de PROBLÈME                                                      |
|---------------|--------------------------------------------------------------------------|
| ML / IA       | Le modèle produit des NaN en inférence depuis le checkpoint epoch 45     |
| Développement | L'API répond en 4s alors que la cible est 200ms — cause non identifiée   |
| Data          | Le pipeline ETL échoue silencieusement sur 12 % des enregistrements      |
| Architecture  | Choisir entre microservices et monolithe modulaire pour ce cas d'usage   |
| Recherche     | Quelle méthodologie d'évaluation pour un corpus en langue peu dotée      |
| Sécurité      | Stratégie d'authentification pour une API publique à fort trafic         |
| Gestion proj. | Arbitrage entre dette technique et délai de livraison sur ce sprint      |

---

## Quand NE PAS utiliser Opus

- Pour une tâche dont la solution est connue → Sonnet
- Pour une correction de code simple → Sonnet avec [CODE]
- Pour rédiger un document standard → Sonnet avec [DOC] ou [SPEC]
- Pour une tâche mécanique (renommage, formatage) → Haiku
- Quand on n'a pas de question précise → reformuler d'abord
