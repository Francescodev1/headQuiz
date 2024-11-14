const Scene = require('Scene');
const Materials = require('Materials');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Time = require('Time');
const Textures = require('Textures');

Promise.all([
    Scene.root.findFirst('domanda'),
    Scene.root.findFirst('sx'),
    Scene.root.findFirst('dx'),
    Scene.root.findFirst('responseText'),
    Scene.root.findFirst('resultText'), // Assicurati di avere un oggetto di testo chiamato 'resultText'
    Scene.root.findFirst('confettiParticles'), // Assicurati di avere un Particle System chiamato 'confettiParticles'
    Materials.findFirst('matDomanda1'),
    Materials.findFirst('matRisposta2'), // Risposta esatta per domanda 1
    Materials.findFirst('matRisposta1'), // Risposta sbagliata per domanda 1
    Materials.findFirst('matDomanda2'),
    Materials.findFirst('matRisposta3'), // Risposta esatta per domanda 2
    Materials.findFirst('matRisposta4'), // Risposta sbagliata per domanda 2
    Materials.findFirst('matDomanda3'),
    Materials.findFirst('matRisposta5'), // Risposta esatta per domanda 3
    Materials.findFirst('matRisposta6'), // Risposta sbagliata per domanda 3
    Materials.findFirst('matDomanda4'),
    Materials.findFirst('matRisposta7'), // Risposta esatta per domanda 4
    Materials.findFirst('matRisposta8'), // Risposta sbagliata per domanda 4
    Materials.findFirst('matDomanda5'),
    Materials.findFirst('matRisposta9'), // Risposta esatta per domanda 5
    Materials.findFirst('matRisposta10'), // Risposta sbagliata per domanda 5
    Materials.findFirst('matDomanda6'),
    Materials.findFirst('matRisposta12'), // Risposta esatta per domanda 6
    Materials.findFirst('matRisposta11'), // Risposta sbagliata per domanda 6
    Materials.findFirst('matDomanda7'),
    Materials.findFirst('matRisposta14'), // Risposta esatta per domanda 7
    Materials.findFirst('matRisposta13'), // Risposta sbagliata per domanda 7
    Materials.findFirst('matDomanda8'),
    Materials.findFirst('matRisposta15'), // Risposta esatta per domanda 8
    Materials.findFirst('matRisposta16'), // Risposta sbagliata per domanda 8
    Materials.findFirst('matDomanda9'),
    Materials.findFirst('matRisposta17'), // Risposta esatta per domanda 9
    Materials.findFirst('matRisposta18'), // Risposta sbagliata per domanda 9
    Materials.findFirst('matDomanda10'),
    Materials.findFirst('matRisposta20'), // Risposta esatta per domanda 10
    Materials.findFirst('matRisposta19')  // Risposta sbagliata per domanda 10
]).then(function(objects) {
    const domandaRect = objects[0];
    const sxRect = objects[1];
    const dxRect = objects[2];
    const responseText = objects[3];
    const resultText = objects[4];
    const confettiParticles = objects[5];
    const materials = objects.slice(6); // Array di tutti i materiali

    if (!responseText || !resultText || !confettiParticles) {
        console.error("Oggetti 'responseText', 'resultText' o 'confettiParticles' non trovati nella scena.");
        return;
    }

    const questions = [
        { questionMaterial: materials[0], leftAnswerMaterial: materials[2], rightAnswerMaterial: materials[1], correctSide: 'right' },
        { questionMaterial: materials[3], leftAnswerMaterial: materials[4], rightAnswerMaterial: materials[5], correctSide: 'left' },
        { questionMaterial: materials[6], leftAnswerMaterial: materials[7], rightAnswerMaterial: materials[8], correctSide: 'left' },
        { questionMaterial: materials[9], leftAnswerMaterial: materials[11], rightAnswerMaterial: materials[10], correctSide: 'left' },
        { questionMaterial: materials[12], leftAnswerMaterial: materials[13], rightAnswerMaterial: materials[14], correctSide: 'left' },
        { questionMaterial: materials[15], leftAnswerMaterial: materials[17], rightAnswerMaterial: materials[16], correctSide: 'right' },
        { questionMaterial: materials[18], leftAnswerMaterial: materials[20], rightAnswerMaterial: materials[19], correctSide: 'left' },
        { questionMaterial: materials[21], leftAnswerMaterial: materials[23], rightAnswerMaterial: materials[22], correctSide: 'right' },
        { questionMaterial: materials[24], leftAnswerMaterial: materials[26], rightAnswerMaterial: materials[25], correctSide: 'left' },
        { questionMaterial: materials[27], leftAnswerMaterial: materials[29], rightAnswerMaterial: materials[28], correctSide: 'right' }
    ];

    let currentQuestionIndex = 0;
    let correctAnswers = 0;

    function showQuestion(index) {
        if (index >= questions.length) {
            endQuiz();
            return;
        }

        const question = questions[index];
        domandaRect.hidden = false;
        sxRect.hidden = false;
        dxRect.hidden = false;
        domandaRect.material = question.questionMaterial;
        sxRect.material = question.leftAnswerMaterial;
        dxRect.material = question.rightAnswerMaterial;
        responseText.text = ""; // Resetta il testo della risposta
        resultText.text = ""; // Nasconde il risultato
        confettiParticles.hidden = true; // Nasconde le particelle
        console.log("Domanda visualizzata: " + index); // Debug
    }

    function endQuiz() {
        domandaRect.hidden = true;
        sxRect.hidden = true;
        dxRect.hidden = true;
        responseText.text = "";
        resultText.text = "Hai ottenuto " + correctAnswers + " risposte corrette su " + questions.length;
        confettiParticles.hidden = false;
        confettiParticles.birthrate = 50; // Attiva il sistema di particelle
        Time.setTimeout(() => {
            confettiParticles.birthrate = 0; // Ferma le particelle dopo un certo periodo di tempo
        }, 10000); // Le particelle durano per 3 secondi
        console.log("Quiz terminato. Risultato: " + correctAnswers + "/" + questions.length);
    }

    // Monitora l'inclinazione della testa sull'asse Z
    const headRotationZ = FaceTracking.face(0).cameraTransform.rotationZ;
    const leftThreshold = -0.3; // Soglia per il movimento verso la spalla sinistra
    const rightThreshold = 0.3; // Soglia per il movimento verso la spalla destra
    let canAnswer = true; // Variabile per evitare risposte multiple senza ritardo

    headRotationZ.monitor().subscribe(function(rotation) {
        console.log("Rotazione Z: " + rotation.newValue); // Debug per vedere il valore della rotazione
        if (canAnswer) {
            if (rotation.newValue < leftThreshold) {
                console.log("Movimento verso la spalla sinistra rilevato");
                handleAnswer('left');
            } else if (rotation.newValue > rightThreshold) {
                console.log("Movimento verso la spalla destra rilevato");
                handleAnswer('right');
            }
        }
    });

    function handleAnswer(side) {
        const question = questions[currentQuestionIndex];
        console.log("Risposta: " + side); // Debug
        if (side === question.correctSide) {
            console.log("Risposta corretta!");
            responseText.text = "Risposta corretta";
            correctAnswers++;
        } else {
            console.log("Risposta sbagliata!");
            responseText.text = "Risposta sbagliata";
        }

        canAnswer = false; // Blocca ulteriori risposte per 1 secondo

        Time.setTimeout(() => {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
            canAnswer = true; // Consente nuove risposte
        }, 1000); // Attendere 1 secondo prima di mostrare la prossima domanda
    }

    showQuestion(currentQuestionIndex);
}).catch(function(error) {
    console.error("Errore nel caricamento degli oggetti o materiali: ", error);
});
