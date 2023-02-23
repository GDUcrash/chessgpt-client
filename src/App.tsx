import { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import cn from 'classnames';

import { IS_SERVER_OFF, DEFAULT_BOARD } from './util/constants';
import { GameSessionData, GameSound } from './util/types';

import { SessionContext } from './context/sessionContext';
import { ServerError } from './hooks/useServer';

import Hero from './components/Hero';
import GameManager from './components/GameManager';
import ChessBoard from './components/ChessBoard';
import TurnInfo from './components/TurnInfo';
import ResponseCard from './components/ResponseCard';
import GameDetails from './components/GameDetails';
import ErrorMessage from './components/ErrorMessage';
import Description from './components/Description';
import Footer from './components/Footer';

import soundNormal from './assets/sounds/normal.mp3';
import soundMoveSelf from './assets/sounds/move-self.mp3';
import soundCapture from './assets/sounds/capture.mp3';
import soundCheck from './assets/sounds/check.mp3';
import soundCastle from './assets/sounds/castle.mp3';
import soundSpawn from './assets/sounds/spawn.mp3';
import soundPromote from './assets/sounds/promote.mp3';
import soundError from './assets/sounds/error.mp3';
import soundGameStart from './assets/sounds/game-start.mp3';
import soundGameEnd from './assets/sounds/game-end.mp3';

import artKingTroll from './assets/art/kingtroll.png';

const App = () => {

    if (IS_SERVER_OFF) return (
        <main className="content">
            <Hero />
            <div className="messageBlock">
                <img src={artKingTroll} alt="King Troll" draggable={false} />
                <h1>We are currently experiencing exceptional server load.</h1>
                <p>
                    The servers are currently offline and I'm investigating the issue.
                    Y'all should chill. Please check back later.
                </p>
            </div>
            <Footer />
        </main>
    );

    const [ playNormal ] = useSound(soundNormal);
    const [ playMoveSelf ] = useSound(soundMoveSelf);
    const [ playCapture ] = useSound(soundCapture);
    const [ playCheck ] = useSound(soundCheck);
    const [ playCastle ] = useSound(soundCastle);
    const [ playSpawn ] = useSound(soundSpawn);
    const [ playPromote ] = useSound(soundPromote);
    const [ playError ] = useSound(soundError);
    const [ playGameStart ] = useSound(soundGameStart);
    const [ playGameEnd ] = useSound(soundGameEnd);

    const sounds: any = {
        normal: playNormal,
        moveSelf: playMoveSelf,
        capture: playCapture,
        check: playCheck,
        castle: playCastle,
        spawn: playSpawn,
        promote: playPromote,
        error: playError,
        gameStart: playGameStart,
        end: playGameEnd,
    };
    
    const [ sessionId, setSessionId ] = useState('');
    const [ sessionData, setSessionData ] = useState<GameSessionData|null>(null);
    const [ sessionError, setSessionError ] = useState<ServerError|null>(null);
    const [ sessionLoading, setSessionLoading ] = useState(false);
    const [ playerMove, setPlayerMove ] = useState("");
    const [ soundOverride, setSoundOverride ] = useState<GameSound|null>(null);
    const boardPrevState = useRef<any|null>(null);

    const sessionContext = {
        id: sessionId, setId: setSessionId,
        data: sessionData, setData: setSessionData,
        error: sessionError, setError: setSessionError,
        loading: sessionLoading, setLoading: setSessionLoading,
        sounds, playerMove, setPlayerMove, boardPrevState,
    };

    const [ textCount, setTextCount ] = useState(0);

    useEffect(() => {
        setTextCount(t => t+1);
    }, [sessionData?.response]);

    useEffect(() => {
        if (soundOverride)
            return;
        if (sessionData?.gameEnd)
            sounds.end();
        else if (sessionData?.sound)
            sounds[sessionData.sound]?.();
    }, [sessionData]);

    useEffect(() => {
        if (soundOverride) {
            sounds[soundOverride]?.();
            setSoundOverride(null);
        }
    }, [soundOverride]);

    const gameStarted = !!sessionData && !sessionData.gameEnd;
    const gameError = gameStarted && !!sessionError;

    return (
        <SessionContext.Provider value={sessionContext}>
            <main className="content">

                <Hero />

                <GameManager
                    gameStarted={gameStarted}
                    canReconnect={gameError}
                    loading={gameStarted ? false : sessionLoading}
                />

                <div className="row">
                    <ChessBoard 
                        board={sessionData?.board ?? DEFAULT_BOARD()} 
                        playable={sessionData ? sessionData.turn === 'white' : false}
                        setSound={sound => {
                            setSoundOverride(sound);
                            setTimeout(() => console.log(sessionData?.sound), 10);
                        }}
                        reRenderBoard={() => {
                            setSessionData({...sessionData, turn: 'black'} as any);
                        }}
                    />

                    <div className={cn("contentBlock", {
                        "hidden": !sessionData,
                    })}>      
                        { gameStarted ? <TurnInfo turn={sessionData?.turn ?? "white"} /> : <div></div> }

                        <div className="col">     
                            <ResponseCard bot
                                text={!sessionLoading ? (sessionData?.response || "") : ""}
                                textCount={textCount}
                                loading={sessionLoading}
                                disabled={!gameStarted}
                                parseError={gameStarted && sessionData?.move === null}
                            />
                            <ResponseCard
                                text={playerMove}
                                disabled={!gameStarted}
                            />
                        </div> 
                    </div>
                </div>

                { sessionError && <ErrorMessage>
                    { sessionError.type === 'createSession' && 'Error creating session! ' }
                    { sessionError.type === 'getLatestMove' && 'Connection error! ' }
                    { sessionError.type === 'makeMove' && 'Error making move! ' }
                    { sessionError.message }
                </ErrorMessage> }

                { gameStarted && <GameDetails 
                    sessionId={sessionId ?? ''}
                    serverId={sessionData?.serverId}
                    user={sessionData?.user}
                /> }

                <Description />

                <Footer />

            </main>
        </SessionContext.Provider>
    );

}

export default App;