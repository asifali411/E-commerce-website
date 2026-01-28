import './App.css';
import Card3D from './components/card/Card3D';
import Button3D from './components/button/Button3D';
import Button2D from './components/button/Button2D';
import Switch from './components/switch/Switch';
import ProgressBar from './components/progressBar/ProgressBar';
import ToolTipContainer from './components/toolTip/ToolTipContainer';
import ToolTip from './components/toolTip/ToolTIp';
import Loader from './components/loader/Loader';
import CheckBox from './components/checkBox/CheckBox';

import NavBar from './pages/nav/NavBar';
import Home from './pages/home/Home';

function App() {

  return (
    <>
      {/* <Card3D display='grid'>
        Card 3D

        <Button2D> Button 2D </Button2D>
        <Button3D> Button 3D </Button3D>

        <Switch size={18}></Switch>

        <ProgressBar progress={30} color={"grey"}></ProgressBar>

        <ToolTipContainer>
          Tool Tip Hover

          <ToolTip>Tool tip content</ToolTip>
        </ToolTipContainer> <br />

        <Loader></Loader> <br />

        <CheckBox></CheckBox>
      </Card3D> */}

      {/* <div className="con">
        <div className="box1"> Primary</div>
        <div className="box2"> Secondary </div>
        <div className="box3"> CTA </div>
        <div className="box4"> Background </div>
        <div className="box5"> Text </div>
        <div className="box6"> Card </div>
        <div className="box7"> Card Border </div>
        <div className="box8"> Muted </div>
      </div> */}

      <Home></Home>
    </>
  )
}

export default App
