import cn from 'classnames';
import { IS_SERVER_LOADED, IS_CHATGPT_AT_CAPACITY } from '../../util/constants';

import classes from './Hero.module.scss';
import logo from '../../assets/icons/logo.svg';

const Hero = () => (
    <div className={classes.container}>
    <div className={classes.content}>
        <h1>
            <img src={logo} alt="ChessGPT Logo" draggable={false} height="32" />
            ChessGPT
            <span className={classes.badge}>Beta</span>
        </h1>
        <p>Play chess against the all-mighty ChatGPT! Powered by the official ChatGPT API ⚡</p>
        { IS_SERVER_LOADED && (
            <div className={cn(classes.message, classes.warn)}>
                ⚠️ Our servers are currently at high demand and most of the users get rate limited by ChatGPT.
                If your move did not process, please click the "Reconnect" button and try making it again.
            </div>
        ) }
        { IS_CHATGPT_AT_CAPACITY && (
            <div className={cn(classes.message, classes.error)}>
                ❌ We are experiencing severe server issues, hold tight while we fix them!
            </div>
        ) }
    </div>
    </div>
);

export default Hero;