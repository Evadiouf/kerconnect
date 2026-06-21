# Template : Clôture de projet / de sprint
# Modèle recommandé : /model sonnet
# Usage : document de clôture formel, rétrospective, archivage

---

## En-tête de prompt à copier-coller

```
TYPE_CLOTURE : {clôture de projet | clôture de sprint | rétrospective | archivage}
PROJET       : {nom du projet — version ou itération}
PÉRIODE      : {date de début → date de fin}
AUDIENCE     : {équipe | direction | client | commanditaire}
LANGUE       : {français | anglais}

DONNÉES      :
- {objectifs initiaux — source : CDC ou backlog}
- {livrables produits — liste ou lien}
- {métriques finales — couverture tests, performance, budget consommé}
- {retours parties prenantes — si disponibles}

INCLURE      : {bilan des objectifs | liste des livrables | métriques | leçons apprises |
                recommandations | actions de suivi | archivage}

TÂCHE        :
Rédige {TYPE_CLOTURE} pour {PROJET}.
Compare les objectifs initiaux aux résultats réels.
Documente les décisions clés et les leçons apprises.
Formule des recommandations concrètes pour les projets suivants.
Écris directement le document sans préambule.
```

---

## Structure standard d'un document de clôture

```
1. Résumé exécutif
   - Objectif initial, résultat final, verdict (livré / partiel / annulé)
   - 3 points forts, 1 point d'amélioration majeur

2. Bilan des objectifs
   | Objectif              | Cible          | Réalisé        | Statut     |
   |-----------------------|----------------|----------------|------------|
   | {objectif 1}          | {valeur cible} | {valeur finale}| ✅ / ⚠️ / ❌|

3. Livrables produits
   | Livrable              | Statut     | Lien / Référence        |
   |-----------------------|------------|-------------------------|
   | {livrable 1}          | Livré      | {lien ou chemin}        |
   | {livrable 2}          | Partiel    | {note}                  |

4. Métriques finales
   - Budget : consommé vs alloué
   - Délai : durée réelle vs estimée
   - Qualité : taux de couverture, incidents, SLA respectés
   - Performance : métriques techniques atteintes

5. Décisions clés et changements de cap
   - {Date} — {décision} — {raison}

6. Leçons apprises
   | Ce qui a bien fonctionné | Ce qui aurait pu être mieux | Recommandation |
   |--------------------------|------------------------------|----------------|
   | {point positif}          | {point négatif}              | {action}       |

7. Risques rencontrés et mitigation
   | Risque               | Impact | Mitigation appliquée           |
   |----------------------|--------|--------------------------------|
   | {risque 1}           | Élevé  | {comment il a été géré}        |

8. Actions de suivi (dette technique, tâches ouvertes, maintenance)
   | Action               | Responsable | Priorité | Délai      |
   |----------------------|-------------|----------|------------|
   | {action 1}           | {nom/rôle}  | Haute    | {date}     |

9. Archivage
   - Dépôt de code : {lien + tag de version}
   - Documentation : {lien ou emplacement}
   - Données et modèles : {emplacement + procédure d'accès}
   - Accès révoqués : {systèmes, environnements, credentials fermés}

10. Validation et signatures
    - Chef de projet : {nom} — {date}
    - Client / commanditaire : {nom} — {date}
```

---

## Structure d'une rétrospective (Agile)

```
1. Ce qui a bien fonctionné (Keep)
   - {pratique ou décision à conserver}

2. Ce qui doit changer (Drop / Change)
   - {problème identifié} → {changement proposé}

3. Ce qu'on veut essayer (Try)
   - {nouvelle pratique à tester au prochain sprint}

4. Actions concrètes
   | Action | Responsable | Done avant |
   |--------|-------------|------------|
   | …      | …           | …          |
```

---

## Checklist de clôture projet

**Livraison**
- [ ] Tous les livrables sont livrés ou leur statut est documenté
- [ ] Le client / commanditaire a validé la livraison
- [ ] La documentation finale est à jour et accessible

**Technique**
- [ ] Le code est taggué (version) et le dépôt archivé
- [ ] Les environnements temporaires sont désactivés
- [ ] Les accès sont révoqués ou transférés

**Connaissance**
- [ ] Les leçons apprises sont documentées
- [ ] Les décisions clés sont tracées (ADR ou journal)
- [ ] Les risques et leur mitigation sont documentés

**Administratif**
- [ ] Le document de clôture est signé par les parties prenantes
- [ ] Les factures et contrats sont soldés ou archivés
- [ ] Le bilan est partagé avec l'équipe
