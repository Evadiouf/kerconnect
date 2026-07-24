<?php

namespace Tests\Feature;

use App\Models\Bien;
use App\Models\Contrat;
use App\Models\Demande;
use App\Models\Paiement;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaiementControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $bailleur;
    private User $client;
    private User $autreCLient;
    private Bien $bien;
    private Contrat $contrat;

    protected function setUp(): void
    {
        parent::setUp();

        Setting::set('commission_active', '0');
        Setting::set('commission_taux', '5');

        $this->bailleur = User::factory()->create([
            'role'              => 'bailleur',
            'inscription_payee' => true,
            'forfait'           => 'starter',
        ]);

        $this->client = User::factory()->create(['role' => 'client']);
        $this->autreClient = User::factory()->create(['role' => 'client']);

        $this->bien = Bien::create([
            'user_id'     => $this->bailleur->id,
            'titre'       => 'Appartement test',
            'type'        => 'appartement',
            'nature'      => 'location',
            'prix'        => 100000,
            'caution_mois' => 2,
            'adresse'     => 'Dakar',
            'ville'       => 'Dakar',
            'statut'      => 'publie',
        ]);

        $demande = Demande::create([
            'bien_id'       => $this->bien->id,
            'demandeur_id'  => $this->client->id,
            'type'          => 'location',
            'statut'        => 'acceptee',
            'prenom_nom'    => $this->client->name,
        ]);

        $this->contrat = Contrat::create([
            'demande_id'   => $demande->id,
            'bien_id'      => $this->bien->id,
            'bailleur_id'  => $this->bailleur->id,
            'locataire_id' => $this->client->id,
            'numero'       => 'CTR-TEST-001',
            'type'         => 'bail',
            'montant'      => 100000,
            'date_debut'   => now(),
            'statut'       => 'valide',
        ]);
    }

    // ══════════════════════════════════════════════════════════
    //  SIMULER — autorisation
    // ══════════════════════════════════════════════════════════

    public function test_simuler_interdit_a_un_utilisateur_non_partie_au_contrat(): void
    {
        $res = $this->actingAs($this->autreClient)
            ->getJson("/api/v1/paiements/simuler?contrat_id={$this->contrat->id}");

        $res->assertForbidden(); // 403
    }

    public function test_simuler_autorise_pour_le_client_du_contrat(): void
    {
        $res = $this->actingAs($this->client)
            ->getJson("/api/v1/paiements/simuler?contrat_id={$this->contrat->id}");

        $res->assertOk();
    }

    public function test_simuler_autorise_pour_le_bailleur_du_contrat(): void
    {
        $res = $this->actingAs($this->bailleur)
            ->getJson("/api/v1/paiements/simuler?contrat_id={$this->contrat->id}");

        $res->assertOk();
    }

    // ══════════════════════════════════════════════════════════
    //  INITIER — montant non-manipulable depuis le client
    // ══════════════════════════════════════════════════════════

    public function test_montant_base_derive_du_contrat_et_non_de_la_requete(): void
    {
        // Le client envoie un montant_base arbitraire (tentative de fraude)
        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id'   => $this->contrat->id,
            'mode'         => 'espece',
            'montant_base' => 1, // valeur frauduleuse
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        // Le montant_base doit être celui du contrat (100 000), pas 1
        $this->assertEquals(100000, (float) $paiement->montant_base);
    }

    // ══════════════════════════════════════════════════════════
    //  PREMIER PAIEMENT — caution incluse
    // ══════════════════════════════════════════════════════════

    public function test_premier_paiement_inclut_la_caution(): void
    {
        // caution_mois = 2, loyer = 100 000 → caution = 200 000
        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $this->assertEquals(200000, (float) $paiement->caution_montant); // 2 × 100 000
        $this->assertEquals(200000, (float) $paiement->montant);         // caution seule (commission = 0)
    }

    public function test_premier_paiement_sans_caution_ne_facture_que_le_loyer(): void
    {
        $this->bien->update(['caution_mois' => 0]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $this->assertNull($paiement->caution_montant);
        $this->assertEquals(100000, (float) $paiement->montant);
    }

    // ══════════════════════════════════════════════════════════
    //  MOIS SUIVANTS — pas de caution, loyer seulement
    // ══════════════════════════════════════════════════════════

    public function test_paiement_suivant_ne_facture_pas_la_caution(): void
    {
        // Simuler un premier paiement déjà confirmé
        Paiement::create([
            'contrat_id'   => $this->contrat->id,
            'payeur_id'    => $this->client->id,
            'reference'    => 'TRX-EXISTANT',
            'montant'      => 200000,
            'montant_base' => 100000,
            'caution_montant' => 200000,
            'mode'         => 'espece',
            'statut'       => 'confirme',
        ]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::latest()->first();
        $this->assertNull($paiement->caution_montant);
        $this->assertEquals(100000, (float) $paiement->montant); // loyer seul
    }

    public function test_paiement_echoue_ne_compte_pas_comme_premier_paiement(): void
    {
        // Un paiement échoué ne doit pas enlever le statut "premier paiement"
        Paiement::create([
            'contrat_id'   => $this->contrat->id,
            'payeur_id'    => $this->client->id,
            'reference'    => 'TRX-ECHOUE',
            'montant'      => 1,
            'montant_base' => 1,
            'mode'         => 'wave',
            'statut'       => 'echoue', // paiement raté
        ]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::where('statut', 'en_attente')->first();
        // caution doit être présente — le paiement échoué ne compte pas
        $this->assertEquals(200000, (float) $paiement->caution_montant);
    }

    // ══════════════════════════════════════════════════════════
    //  VENTE — jamais de caution
    // ══════════════════════════════════════════════════════════

    public function test_contrat_vente_sans_caution_meme_si_bien_a_caution_mois(): void
    {
        $bienVente = Bien::create([
            'user_id'     => $this->bailleur->id,
            'titre'       => 'Villa vente',
            'type'        => 'villa',
            'nature'      => 'vente',
            'prix'        => 50000000,
            'caution_mois' => 3, // ne doit pas s'appliquer pour une vente
            'adresse'     => 'Dakar',
            'ville'       => 'Dakar',
            'statut'      => 'publie',
        ]);

        $demande = Demande::create([
            'bien_id'      => $bienVente->id,
            'demandeur_id' => $this->client->id,
            'type'         => 'achat',
            'statut'       => 'acceptee',
            'prenom_nom'   => $this->client->name,
        ]);

        $contratVente = Contrat::create([
            'demande_id'   => $demande->id,
            'bien_id'      => $bienVente->id,
            'bailleur_id'  => $this->bailleur->id,
            'locataire_id' => $this->client->id,
            'numero'       => 'CTR-VENTE-001',
            'type'         => 'vente',
            'montant'      => 50000000,
            'date_debut'   => now(),
            'statut'       => 'valide',
        ]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $contratVente->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $this->assertNull($paiement->caution_montant);
        $this->assertEquals(50000000, (float) $paiement->montant);
    }

    // ══════════════════════════════════════════════════════════
    //  COMMISSION
    // ══════════════════════════════════════════════════════════

    public function test_commission_calculee_sur_le_loyer_de_base_seulement(): void
    {
        Setting::set('commission_active', '1');
        // Forfait starter = 5% de commission
        $this->bailleur->update(['forfait' => 'starter']);

        // Caution désactivée pour isoler le calcul de commission
        $this->bien->update(['caution_mois' => 0]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $commissionAttendue = round(100000 * 5 / 100, 2); // 5 000
        $this->assertEquals(5.0, (float) $paiement->commission_taux);
        $this->assertEquals($commissionAttendue, (float) $paiement->commission_montant);
        $this->assertEquals(100000 + $commissionAttendue, (float) $paiement->montant);
    }

    public function test_commission_jamais_calculee_sur_la_caution(): void
    {
        Setting::set('commission_active', '1');
        $this->bailleur->update(['forfait' => 'starter']); // 5%

        // caution_mois = 2, loyer = 100 000 → caution = 200 000
        // Commission doit être 5% de 100 000 = 5 000 (pas 5% de 200 000)
        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $this->assertEquals(5000, (float) $paiement->commission_montant); // 5% × 100 000
        $this->assertEquals(205000, (float) $paiement->montant);          // caution + commission
    }

    public function test_commission_taux_selon_forfait_pro(): void
    {
        Setting::set('commission_active', '1');
        $this->bailleur->update(['forfait' => 'pro', 'forfait_expire_at' => now()->addMonth()]);
        $this->bien->update(['caution_mois' => 0]);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertStatus(201);

        $paiement = Paiement::first();
        $this->assertEquals(4.0, (float) $paiement->commission_taux);   // Pro = 4%
        $this->assertEquals(4000, (float) $paiement->commission_montant); // 4% × 100 000
    }

    // ══════════════════════════════════════════════════════════
    //  AUTORISATION — initier
    // ══════════════════════════════════════════════════════════

    public function test_initier_interdit_a_un_utilisateur_non_partie_au_contrat(): void
    {
        $res = $this->actingAs($this->autreClient)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertForbidden(); // 403
    }

    public function test_initier_interdit_si_contrat_non_valide(): void
    {
        $this->contrat->update(['statut' => 'brouillon']);

        $res = $this->actingAs($this->client)->postJson('/api/v1/paiements', [
            'contrat_id' => $this->contrat->id,
            'mode'       => 'espece',
        ]);

        $res->assertUnprocessable(); // 422
    }

    // ══════════════════════════════════════════════════════════
    //  CONFIRMER — seul le bailleur peut confirmer
    // ══════════════════════════════════════════════════════════

    public function test_confirmer_interdit_au_client(): void
    {
        $paiement = Paiement::create([
            'contrat_id'   => $this->contrat->id,
            'payeur_id'    => $this->client->id,
            'reference'    => 'TRX-TEST',
            'montant'      => 100000,
            'montant_base' => 100000,
            'mode'         => 'espece',
            'statut'       => 'en_attente',
        ]);

        $res = $this->actingAs($this->client)
            ->postJson("/api/v1/paiements/{$paiement->id}/confirmer");

        $res->assertForbidden();
    }

    public function test_confirmer_par_le_bailleur_change_le_statut_a_confirme(): void
    {
        $paiement = Paiement::create([
            'contrat_id'   => $this->contrat->id,
            'payeur_id'    => $this->client->id,
            'reference'    => 'TRX-TEST',
            'montant'      => 100000,
            'montant_base' => 100000,
            'mode'         => 'espece',
            'statut'       => 'en_attente',
        ]);

        $res = $this->actingAs($this->bailleur)
            ->postJson("/api/v1/paiements/{$paiement->id}/confirmer");

        $res->assertOk();
        $this->assertEquals('confirme', $paiement->fresh()->statut);
    }
}
