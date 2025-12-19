import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LearningManagementSystem from './LearningManagementSystem';
import NAAC from './NAAC';
import Reports from './Reports';
import Parct1 from './pages/pract1';
import AddUser from './Crud/Add';
import EditUser from './Crud/Edit';
import DeleteUser from './Crud/Delete';
import ExportUsers from './Crud/Export';
import Viewcourse from './pages/Viewcourse';
import Viewcourse1 from './pages/Viewcourse1';
import Login from './pages/Login';
import Dashmcas11 from './pages/Dashmcas11';

import Dashmncas11 from './pages/Dashmncas11';
import Dashmncas11admin from './pages/Dashmncas11admin';
import Dashmncas12 from './pages/Dashmncas12';
import Dashmncas12admin from './pages/Dashmncas12admin';

import Dashmncas22 from './pages/Dashmncas22';
import Dashmncas22admin from './pages/Dashmncas22admin';
import Dashmncas23 from './pages/Dashmncas23';
import Dashmncas23admin from './pages/Dashmncas23admin';
import Dashmncas241 from './pages/Dashmncas241';
import Dashmncas241admin from './pages/Dashmncas241admin';
import Dashmncas242 from './pages/Dashmncas242';
import Dashmncas242admin from './pages/Dashmncas242admin';
import Dashmncas243 from './pages/Dashmncas243';
import Dashmncas243admin from './pages/Dashmncas243admin';
import Dashmncas251 from './pages/Dashmncas251';
import Dashmncas251admin from './pages/Dashmncas251admin';
import Dashmncas252 from './pages/Dashmncas252';
import Dashmncas252admin from './pages/Dashmncas252admin';
import Dashmncas253 from './pages/Dashmncas253';
import Dashmncas253admin from './pages/Dashmncas253admin';
import Dashmncas26 from './pages/Dashmncas26';
import Dashmncas26admin from './pages/Dashmncas26admin';

import Dashmprojects from './pages/Dashmprojects';
import Dashmprojectsadmin from './pages/Dashmprojectsadmin';

import Dashmpublications from './pages/Dashmpublications';
import Dashmpublicationsadmin from './pages/Dashmpublicationsadmin';
import Dashmpatents from './pages/Dashmpatents';
import Dashmpatentsadmin from './pages/Dashmpatentsadmin';
import Dashmteacherfellow from './pages/Dashmteacherfellow';
import Dashmteacherfellowadmin from './pages/Dashmteacherfellowadmin';
import Dashmconsultancy from './pages/Dashmconsultancy';
import Dashmconsultancyadmin from './pages/Dashmconsultancyadmin';
import Dashmphdguide from './pages/Dashmphdguide';
import Dashmphdguideadmin from './pages/Dashmphdguideadmin';
import Dashmseminar from './pages/Dashmseminar';
import Dashmseminaradmin from './pages/Dashmseminaradmin';
import Dashmbook from './pages/Dashmbook';
import Dashmbookadmin from './pages/Dashmbookadmin';

import Dashmexamschedule from './pages/Dashmexamschedule';
import Dashmexamscheduleadmin from './pages/Dashmexamscheduleadmin';
import Dashmexamroom from './pages/Dashmexamroom';
import Dashmexamroomadmin from './pages/Dashmexamroomadmin';

import Loginstud from './pages/Loginstud';

import Dashmmprograms from './pages/Dashmmprograms';
import Dashmmprogramsadmin from './pages/Dashmmprogramsadmin';
import Dashmmcourses from './pages/Dashmmcourses';
import Dashmmcoursesadmin from './pages/Dashmmcoursesadmin';
import Dashmmstudents from './pages/Dashmmstudents';
import Dashmmstudentsadmin from './pages/Dashmmstudentsadmin';
import Dashmexamtimetable from './pages/Dashmexamtimetable';
import Dashmexamtimetableadmin from './pages/Dashmexamtimetableadmin';

import Dashmmfaccourses from './pages/Dashmmfaccourses';
import Dashmmfaccoursesadmin from './pages/Dashmmfaccoursesadmin';
import Dashmmfaccoursesatt from './pages/Dashmmfaccoursesatt';
import Dashmmfaccoursesattadmin from './pages/Dashmmfaccoursesattadmin';

import Dashmmattcalc from './pages/Dashmmattcalc';
import Dashmmattcalcadmin from './pages/Dashmmattcalcadmin';

import Dashmmcolevels from './pages/Dashmmcolevels';
import Dashmmcolevelsadmin from './pages/Dashmmcolevelsadmin';

import Dashmmcolevelscalc from './pages/Dashmmcolevelscalc';

import Dashmmcourseslist from './pages/Dashmmcourseslist';
import Dashmmcourseslistadmin from './pages/Dashmmcourseslistadmin';

import Dashmmstudents1 from './pages/Dashmmstudents1';
import Dashmmstudents1admin from './pages/Dashmmstudents1admin';

import Dashmclassenr1 from './pages/Dashmclassenr1';
import Dashmclassenr1admin from './pages/Dashmclassenr1admin';

import Dashmclassenr1stud from './pages/Dashmclassenr1stud';

import Dashmmsyllabus from './pages/Dashmmsyllabus';
import Dashmmsyllabusstud from './pages/Dashmmsyllabusstud';
import Dashmmsyllabusadmin from './pages/Dashmmsyllabusadmin';

import Dashmmassignments from './pages/Dashmmassignments';
import Dashmmassignmentsadmin from './pages/Dashmmassignmentsadmin';
import Dashmmanouncements from './pages/Dashmmanouncements';
import Dashmmanouncementsadmin from './pages/Dashmmanouncementsadmin';
import Dashmmcourseco from './pages/Dashmmcourseco';
import Dashmmcoursecoadmin from './pages/Dashmmcoursecoadmin';
import Dashmmcalendar from './pages/Dashmmcalendar';
import Dashmmcalendaradmin from './pages/Dashmmcalendaradmin';
import Dashmmcoursematerial from './pages/Dashmmcoursematerial';
import Dashmmcoursematerialadmin from './pages/Dashmmcoursematerialadmin';

import Dashmmannouncementsstud from './pages/Dashmmannouncementsstud';
import Dashmmassignmentsstud from './pages/Dashmmassignmentsstud';
import Dashmmcalendarstud from './pages/Dashmmcalendarstud';
import Dashmmcoursematerialstud from './pages/Dashmmcoursematerialstud';
import Dashmmcoursecostud from './pages/Dashmmcoursecostud';

import Dashmmassignsubmit from './pages/Dashmmassignsubmit';
import Dashmmassignsubmitadmin from './pages/Dashmmassignsubmitadmin';
import Dashmmdiscussion from './pages/Dashmmdiscussion';
import Dashmmdiscussionadmin from './pages/Dashmmdiscussionadmin';

import Dashmmassignsubmitfac from './pages/Dashmmassignsubmitfac';

import Dashmquotanew from './pages/Dashmquotanew';
import Dashmquotanewadmin from './pages/Dashmquotanewadmin';

// import Resistor from './pages/Resistor';
// import Bubblesort from './pages/BubbleSort';
// import Firstsimulator from './pages/FirstSimulator';
// import SecondSimulator from './pages/SecondSimulator';

import Dashmclassnew from './pages/Dashmclassnew';
import Dashmclassnewadmin from './pages/Dashmclassnewadmin';
import Dashmattendancenew from './pages/Dashmattendancenew';
import Dashmattendancenewadmin from './pages/Dashmattendancenewadmin';

import SubHalfAdder1 from './pages/SubHalfAdder1';
import BasicLogicGateExpFirst from './pages/BasicLogicGateExpFirst';
import BasicLogicGateExpSecond from './pages/BasicLogicGateExpSecond';
import HalfSubtractor from './pages/HalfSubtractor';
import FullSubtractor from './pages/FullSubtractor';
import TwoBitAdder from './pages/TwoBitAdder';

import Dashmattccode from './pages/Dashmattccode';
import Dashmattpcode from './pages/Dashmattpcode';
import Dashmclassnewc from './pages/Dashmclassnewc';

import Dashmclassnewstud from './pages/Dashmclassnewstud';
import FourBitAdderSubtractor from './pages/FourBitAdderSubtractor';

import Dashmstudawardsnew from './pages/Dashmstudawardsnew';
import Dashmstudawardsnewadmin from './pages/Dashmstudawardsnewadmin';
import Dashmscholnew from './pages/Dashmscholnew';
import Dashmscholnewadmin from './pages/Dashmscholnewadmin';
import Dashmscholnewstud from './pages/Dashmscholnewstud';
import Dashmstudawardsnewstud from './pages/Dashmstudawardsnewstud';

import Dashmslideshow from './pages/Dashmslideshow';
import Dashmslideshowadmin from './pages/Dashmslideshowadmin';

import Dashmeventsnew1 from './pages/Dashmeventsnew1';
import Dashmeventsnew1admin from './pages/Dashmeventsnew1admin';
import Dashmpolicy from './pages/Dashmpolicy';

import Dashmqualitative from './pages/Dashmqualitative';

import Dashmtestnew from './pages/Dashmtestnew';
import Dashmtestnewadmin from './pages/Dashmtestnewadmin';
import Dashmtestq from './pages/Dashmtestq';
import Dashmtestqadmin from './pages/Dashmtestqadmin';
import Dashmtesto from './pages/Dashmtesto';
import Dashmtestoadmin from './pages/Dashmtestoadmin';

import CharacterizationOfDigitalLogic from './pages/CharacterizationOfDigitalLogic';

import InsertionSort from './pages/InsertionSort';
import SelectionSort from './pages/SelectionSort';

import Dashmtestnewstud from './pages/Dashmtestnewstud';

import StackVisualization from './pages/StackVisualization';
import ArrayVisualization from './pages/ArrayVisualization';
import BinaryArithmeticSimulation from './pages/BinaryArithmeticSimulation';

import QueueVisualization from './pages/QueueVisualization';
import BinarySearch from './pages/BinarySearch';
import BinaryArithmeticS from './pages/BinaryArithmeticS';

import NOTGate from './pages/NOTGate';
import NOTGate2 from './pages/NOTGate2';
import ANDGate from './pages/ANDGate';
import ANDGate2 from './pages/ANDGate2';
import ORGate from './pages/ORGate';
import ORGate2 from './pages/ORGate2';

import Dashmtestqstud from './pages/Dashmtestqstud';

import NANDGate from './pages/NANDGate';
import NANDGate2 from './pages/NANDGate2';
import NORGate from './pages/NORGate';
import NORGate2 from './pages/NORGate2';

import Dashmgeotagtest from './pages/Dashmgeotagtest';

import XORGate from './pages/XORGate';
import HalfSubtractorCircuit from './pages/HalfSubtractorCircuit';

import XNORGate from './pages/XNORGate';
import XNORGate2 from './pages/XNORGate2';
import XORGate2 from './pages/XORGate2';

import FullSubCircuitVerify from './pages/FullSubCircuitVerify';
import FullSubtractorCircuit from './pages/FullSubtractorCircuit';
import HalfSubCircuitVerify from './pages/HalfSubCircuitVerify';

import VideoPage from './pages/VideoPage';

import CodeEditor from './pages/CodeEditor';
import BCDToExcessConverter from './pages/BCDToExcessConverter';
import BitSerial from './pages/BitSerial';
import GrayToBinaryConverter from './pages/GrayToBinaryConverter';

import Dashmlmsvideos from './pages/Dashmlmsvideos';
import Dashmlmsvideosadmin from './pages/Dashmlmsvideosadmin';
import Dashmlmsvideosc from './pages/Dashmlmsvideosc';
import Dashmlmsvideoscadmin from './pages/Dashmlmsvideoscadmin';

import VideoPage2 from './pages/VideoPage2';
import Videopagepre from './pages/Videopagepre';
import Videopage3 from './pages/Videopage3';
import Videopage31 from './pages/Videopage31';

import Videopagepreshare from './pages/Videopagepreshare';

import Dashmhtmleditor from './pages/Dashmhtmleditor';

import Circulareventsm from './pages/Circulareventsm';

import CampusWebsite from './pages/CampusWebsite';

import SignupPage from './pages/SignupPage';
import Signinpage from './pages/Signinpage';

import Dashmmvac from './pages/Dashmmvac';
import Dashmmvacadmin from './pages/Dashmmvacadmin';

import Dashawsconfig from './pages/Dashawsconfig';

import Dashmtestscoreall from './pages/Dashmtestscoreall';
import StefansLaw from './pages/StefansLaw';
import Videopage32 from './pages/Videopage32';
import Videopage32a from './pages/Videopage32a';
import PhaseSequenceSynchronous from './pages/PhaseSequenceSynchronous';

import OpticalFibre from './pages/OpticalFibre';
import TransformerOilStrength from './pages/TransformerOilStrength';

import Dashmpassword from './pages/Dashmpassword';
import Dashmpasswordstud from './pages/Dashmpasswordstud';


import Dashmlpublications from './pages/Dashmlpublications';
import Dashmlpublicationsadmin from './pages/Dashmlpublicationsadmin';
import Dashmlpubeditions from './pages/Dashmlpubeditions';
import Dashmlpubeditionsadmin from './pages/Dashmlpubeditionsadmin';
import Dashmlpubreviews from './pages/Dashmlpubreviews';
import Dashmlpubreviewsadmin from './pages/Dashmlpubreviewsadmin';
import Dashmlpubarticles from './pages/Dashmlpubarticles';
import Dashmlpubarticlesadmin from './pages/Dashmlpubarticlesadmin';

import Dashmlpublicationspublic from './pages/Dashmlpublicationspublic';
import Dashmlpubeditionspublic from './pages/Dashmlpubeditionspublic';

import DigitalTriradii from './pages/DigitalTriradii';
import FingerPrintPatterns from './pages/FingerPrintPatterns';

import DCShuntMotorSimulation from './pages/DCShuntMotorSimulation';
import SkeletonExp from './pages/SkeletonExp';

import Titration from './pages/Titration';
import SkeletonExpPart2 from './pages/SkeletonExpPart2';
import InfraRedSpectros from './pages/InfraRedSpectros';

import SkeletonExpPart2Game from './pages/SkeletonExpPart2Game';
import GetMoldGame from './pages/GetMoldGame';
import OpticalFibreGame from './pages/OpticalFibreGame';
import DigitalTriradiiGame from './pages/DigitalTriradiiGame';

import TransformerOilStrengthGame from './pages/TransformerOilStrengthGame';
import TitrationGame from './pages/TitrationGame';
import InfraRedSpectrosGame from './pages/InfraRedSpectrosGame';
import Dashmmplacement from './pages/Dashmmplacement';
import Dashmmplacementadmin from './pages/Dashmmplacementadmin';

import Dashmmassets from './pages/Dashmmassets';
import Dashmmassetsadmin from './pages/Dashmmassetsadmin';
import Dashmmassetassign from './pages/Dashmmassetassign';
import Dashmmassetassignadmin from './pages/Dashmmassetassignadmin';
import Dashmmvendors from './pages/Dashmmvendors';
import Dashmmvendorsadmin from './pages/Dashmmvendorsadmin';
import Dashmmvendorbanks from './pages/Dashmmvendorbanks';
import Dashmmvendorbanksadmin from './pages/Dashmmvendorbanksadmin';
import Dashmmpurchase from './pages/Dashmmpurchase';
import Dashmmpurchaseadmin from './pages/Dashmmpurchaseadmin';
import Dashmmpurchaseitems from './pages/Dashmmpurchaseitems';
import Dashmmpurchaseitemsadmin from './pages/Dashmmpurchaseitemsadmin';
import Dashmmpopayments from './pages/Dashmmpopayments';
import Dashmmpopaymentsadmin from './pages/Dashmmpopaymentsadmin';

import BCDToExcessConverterGame from './pages/BCDToExcessConverterGame';
// import BinaryToGrayConverterGame from './pages/BinaryToGrayConverterGame';
// import DCShuntMotorSimulationGame from './pages/DCShuntMotorSimulationGame';
import FullSubCircuitVerifyGame from './pages/FullSubCircuitVerifyGame';
import FullSubtractorCircuitGame from './pages/FullSubtractorCircuitGame';
import GrayToBinaryConverterGame from './pages/GrayToBinaryConverterGame';
import HalfSubCircuitVerifyGame from './pages/HalfSubCircuitVerifyGame';
import HalfSubtractorCircuitGame from './pages/HalfSubtractorCircuitGame';

import ANDGateGame from './pages/ANDGateGame';
import BitSerialGame from './pages/BitSerialGame';
import FingerPrintPatternsGame from './pages/FingerPrintPatternsGame';
import NANDGateGame from './pages/NANDGateGame';
import NORGateGame from './pages/NORGateGame';

import NOTGateGame from './pages/NOTGateGame.js';
// import OpticalFibreGame from './pages/OpticalFibreGame.js';
import ORGateGame from './pages/ORGateGame.js';
// import ResistorGame from './pages/ResistorGame.js';
import SkeletonExpGame from './pages/SkeletonExpGame.js';
// import SkeletonExpPart2Game from './pages/SkeletonExpPart2Game.js';
import StefansLawGame from './pages/StefansLawGame.js';
import SubHalfAdder1Game from './pages/SubHalfAdder1Game.js';
import XNORGateGame from './pages/XNORGateGame.js';
import XORGateGame from './pages/XORGateGame.js';

import Dashmstudgender from './pages/Dashmstudgender.js';
import Dashmstudcategory from './pages/Dashmstudcategory.js';
import Dashmstudquota from './pages/Dashmstudquota.js';

import FindDiff from './pages/FindDiff.js';
import RaceGame from './pages/RaceGame.js';
import WordGuessing from './pages/WordGuessing.js';
import ImgPuzzle from './pages/ImgPuzzle.js';
import PacManGame from './pages/PacMan.js';
import BetterAimGame2 from './pages/BatterAim.js';

import TetrisGame from './pages/TetrisGame.js';
// import DiceGame from './pages/DiceGame.js';
import SudokuGame from './pages/SudokuGame.js';
import TowerOfHanoi from './pages/TowerOfHanoi.js';
import UltimateBattleGame from './pages/UltimateBattleGame.js';
// import MazeGen from './pages/MazeGen.js';

import Dashmmtestnewm from './pages/Dashmmtestnewm';
import Dashmmtestnewmadmin from './pages/Dashmmtestnewmadmin';
import Dashmmtestseenrol from './pages/Dashmmtestseenrol';
import Dashmmtestseenroladmin from './pages/Dashmmtestseenroladmin';
import Dashmmtestsections from './pages/Dashmmtestsections';
import Dashmmtestsectionsadmin from './pages/Dashmmtestsectionsadmin';
import Dashmmtestqnew from './pages/Dashmmtestqnew';
import Dashmmtestqnewadmin from './pages/Dashmmtestqnewadmin';
import Dashmmtestsessions from './pages/Dashmmtestsessions';
import Dashmmtestsessionsadmin from './pages/Dashmmtestsessionsadmin';

import Dashmmtestsections1 from './pages/Dashmmtestsections1';
import Dashmmtestsections1admin from './pages/Dashmmtestsections1admin';

import Dashmmtestseenrol1 from './pages/Dashmmtestseenrol1';
import Dashmmtestseenrol1admin from './pages/Dashmmtestseenrol1admin';

import CampusTalent from './pages/CampusTalent';

import Dashmtestscorenew from './pages/Dashmtestscorenew.js';

import Dashmmguides from './pages/Dashmmguides';
import Dashmmguidesadmin from './pages/Dashmmguidesadmin';
import Dashmmctalentreg from './pages/Dashmmctalentreg';
import Dashmmctalentregadmin from './pages/Dashmmctalentregadmin';
import Dashmmtestqnewcs from './pages/Dashmmtestqnewcs';
import Dashmmtestqnewcsadmin from './pages/Dashmmtestqnewcsadmin';

import CampusTalentRegister from './pages/CampusTalentRegister';
import CampusTalent1 from './pages/CampusTalent1.js';

import Dashmonlinepay from './pages/Dashmonlinepay';
import Dashmonlinepayadmin from './pages/Dashmonlinepayadmin';

import CampusTalentRegister1 from './pages/CampusTalentRegister1';

import Signinpay from './pages/Signinpay';
import Forgotpassword from './pages/Forgotpassword';

import Dashmtestscoresnewall from './pages/Dashmtestscoresnewall';

import Deleteaccount from './pages/Deleteaccount';

import Viewmreactflow1 from './pages/Viewmreactflow1';
import Dashmreactflow1 from './pages/Dashmreactflow1';


import Dashmmindmaplist from './pages/Dashmmindmaplist';
import Dashmmindmaplistadmin from './pages/Dashmmindmaplistadmin';
import Dashmmindmapedges from './pages/Dashmmindmapedges';
import Dashmmindmapedgesadmin from './pages/Dashmmindmapedgesadmin';
import Dashmmindmapnodes from './pages/Dashmmindmapnodes';
import Dashmmindmapnodesadmin from './pages/Dashmmindmapnodesadmin';

import Viewmindmap from './pages/Viewmindmap';
import Viewmindmap1 from './pages/Viewmindmap1';
import Viewmindmap2 from './pages/Viewmindmap2';


import Dashmminewm from './pages/Dashmminewm';
import Dashmminewmadmin from './pages/Dashmminewmadmin';
import Dashmmisessions from './pages/Dashmmisessions';
import Dashmmisessionsadmin from './pages/Dashmmisessionsadmin';
import Dashmmiseenrol1 from './pages/Dashmmiseenrol1';
import Dashmmiseenrol1admin from './pages/Dashmmiseenrol1admin';
import Dashmmisections1 from './pages/Dashmmisections1';
import Dashmmisections1admin from './pages/Dashmmisections1admin';
import Dashmmiqnew from './pages/Dashmmiqnew';
import Dashmmiqnewadmin from './pages/Dashmmiqnewadmin';

import Dashmmiscorenew from './pages/Dashmmiscorenew';

import Viewmallclients from './pages/Viewmallclients';
import Viewmusers from './pages/Viewmusers';
import Viewminterns from './pages/Viewminterns';

import Dashmbmou from './pages/Dashmbmou';
import Dashmbmouadmin from './pages/Dashmbmouadmin';

import Dashmbtrialb from './pages/Dashmbtrialb';
import Dashmbtrialbadmin from './pages/Dashmbtrialbadmin';
import Dashmstudlist from './pages/Dashmstudlist';
import Dashmstudlistadmin from './pages/Dashmstudlistadmin';
import Dashmbfacyear from './pages/Dashmbfacyear';
import Dashmbfacyearadmin from './pages/Dashmbfacyearadmin';

import Viewmpricing from './pages/Viewmpricing';

import CampusPricing from './pages/CampusPricing';

import SignupAdmin from './pages/SignupAdmin';

import Internall from './pages/Internall';

import Internselect from './pages/Internselect';
import Courseall from './pages/Courseall';


import stest2 from './pages/stest2';

import SeedTest1 from './pages/SeedTest1';
import AcademicAuditInfo from './pages/AcademicAuditInfo';
import AAaudit from './pages/AAaudit';
import GreenAudit from './pages/GreenAudit';

import Dashtest1 from './pages/Dashtest1';

import Dashmnn11 from './pages/Dashmnn11';
import Dashmnn11admin from './pages/Dashmnn11admin';
import Dashmnn12 from './pages/Dashmnn12';
import Dashmnn12admin from './pages/Dashmnn12admin';
import Dashmnn14 from './pages/Dashmnn14';
import Dashmnn14admin from './pages/Dashmnn14admin';
import Dashmnn15 from './pages/Dashmnn15';
import Dashmnn15admin from './pages/Dashmnn15admin';
import Dashmnn17 from './pages/Dashmnn17';
import Dashmnn17admin from './pages/Dashmnn17admin';
import Dashmnn16 from './pages/Dashmnn16';
import Dashmnn16admin from './pages/Dashmnn16admin';


import Dashmnn211a from './pages/Dashmnn211a';
import Dashmnn211aadmin from './pages/Dashmnn211aadmin';
import Dashmnn211b from './pages/Dashmnn211b';
import Dashmnn211badmin from './pages/Dashmnn211badmin';
import Dashmnn23 from './pages/Dashmnn23';
import Dashmnn23admin from './pages/Dashmnn23admin';
import Dashmnn22 from './pages/Dashmnn22';
import Dashmnn22admin from './pages/Dashmnn22admin';
import Dashmnn244 from './pages/Dashmnn244';
import Dashmnn244admin from './pages/Dashmnn244admin';
import Dashmnn26 from './pages/Dashmnn26';
import Dashmnn26admin from './pages/Dashmnn26admin';
import Dashmnn25 from './pages/Dashmnn25';
import Dashmnn25admin from './pages/Dashmnn25admin';
import Dashmnn31 from './pages/Dashmnn31';
import Dashmnn31admin from './pages/Dashmnn31admin';
import Dashmnn32 from './pages/Dashmnn32';
import Dashmnn32admin from './pages/Dashmnn32admin';

import Dashmnn33a from './pages/Dashmnn33a';
import Dashmnn33aadmin from './pages/Dashmnn33aadmin';
import Dashmnn33b from './pages/Dashmnn33b';
import Dashmnn33badmin from './pages/Dashmnn33badmin';
import Dashmnn35 from './pages/Dashmnn35';
import Dashmnn35admin from './pages/Dashmnn35admin';
import Dashmnn36 from './pages/Dashmnn36';
import Dashmnn36admin from './pages/Dashmnn36admin';
import Dashmnn46 from './pages/Dashmnn46';
import Dashmnn46admin from './pages/Dashmnn46admin';

import Dashmnn51 from './pages/Dashmnn51';
import Dashmnn51admin from './pages/Dashmnn51admin';
import Dashmnn52 from './pages/Dashmnn52';
import Dashmnn52admin from './pages/Dashmnn52admin';
import Dashmnn53examdays from './pages/Dashmnn53examdays';
import Dashmnn53examdaysadmin from './pages/Dashmnn53examdaysadmin';
import Dashmnn53passp from './pages/Dashmnn53passp';
import Dashmnn53passpadmin from './pages/Dashmnn53passpadmin';
import Dashmnn53obe from './pages/Dashmnn53obe';
import Dashmnn53obeadmin from './pages/Dashmnn53obeadmin';
import Dashmnn54 from './pages/Dashmnn54';
import Dashmnn54admin from './pages/Dashmnn54admin';
import Dashmnn55 from './pages/Dashmnn55';
import Dashmnn55admin from './pages/Dashmnn55admin';
import Dashmnn56 from './pages/Dashmnn56';
import Dashmnn56admin from './pages/Dashmnn56admin';

import Dashmnallaccr from './pages/Dashmnallaccr';
import Dashmnallaccradmin from './pages/Dashmnallaccradmin';

import Dashmqualall from './pages/Dashmqualall';

import ElectricalMachineLab from './pages/ElectricalMachineLab';

import Dashmnallaccrans from './pages/Dashmnallaccrans';
import Dashmnallaccransadmin from './pages/Dashmnallaccransadmin';

import Dashmnn61 from './pages/Dashmnn61';
import Dashmnn61admin from './pages/Dashmnn61admin';
import Dashmnn62 from './pages/Dashmnn62';
import Dashmnn62admin from './pages/Dashmnn62admin';
import Dashmnn6clubs from './pages/Dashmnn6clubs';
import Dashmnn6clubsadmin from './pages/Dashmnn6clubsadmin';

import Dashmnn76 from './pages/Dashmnn76';
import Dashmnn76admin from './pages/Dashmnn76admin';
import Dashmnn781 from './pages/Dashmnn781';
import Dashmnn781admin from './pages/Dashmnn781admin';
import Dashmnn82 from './pages/Dashmnn82';
import Dashmnn82admin from './pages/Dashmnn82admin';
import Dashmnn84 from './pages/Dashmnn84';
import Dashmnn84admin from './pages/Dashmnn84admin';
import Dashmnn83 from './pages/Dashmnn83';
import Dashmnn83admin from './pages/Dashmnn83admin';
import Dashmnn86 from './pages/Dashmnn86';
import Dashmnn86admin from './pages/Dashmnn86admin';
import Dashmnn87 from './pages/Dashmnn87';
import Dashmnn87admin from './pages/Dashmnn87admin';
import Dashmnn96 from './pages/Dashmnn96';
import Dashmnn96admin from './pages/Dashmnn96admin';
import Dashmnn98 from './pages/Dashmnn98';
import Dashmnn98admin from './pages/Dashmnn98admin';
import Dashmnn97 from './pages/Dashmnn97';
import Dashmnn97admin from './pages/Dashmnn97admin';

import Dashmmfaccoursesatto from './pages/Dashmmfaccoursesatto';

import Dashmattyear from './pages/Dashmattyear';
import Dashmattyearadmin from './pages/Dashmattyearadmin';

import Dashmngroup from './pages/Dashmngroup';
import Dashmngroupadmin from './pages/Dashmngroupadmin';
import Dashmngrouppages from './pages/Dashmngrouppages';
import Dashmngrouppagesadmin from './pages/Dashmngrouppagesadmin';
import Dashmngroupaccr from './pages/Dashmngroupaccr';
import Dashmngroupaccradmin from './pages/Dashmngroupaccradmin';

import Dashmnallaccrgroup from './pages/Dashmnallaccrgroup';

import Dashmmstudentprofile from './pages/Dashmmstudentprofile';

import Dashmtimeslotsn from './pages/Dashmtimeslotsn';
import Dashmtimeslotsnadmin from './pages/Dashmtimeslotsnadmin';
import Dashmworkloadn from './pages/Dashmworkloadn';
import Dashmworkloadnadmin from './pages/Dashmworkloadnadmin';

import Dashmtimeslotsn1 from './pages/Dashmtimeslotsn1';
import Dashmtimeslotsn1admin from './pages/Dashmtimeslotsn1admin';
import Dashmworkloadn1 from './pages/Dashmworkloadn1';
import Dashmworkloadn1admin from './pages/Dashmworkloadn1admin';

import Dashmfacwcal from './pages/Dashmfacwcal';
import Dashmfacwcaladmin from './pages/Dashmfacwcaladmin';


import AdmissionTemplate1 from "./pages/forms/AdmissionTemplate1";
import AdmissionTemplate2 from "./pages/forms/AdmissionTemplate2";
import AdmissionTemplate3 from "./pages/forms/AdmissionTemplate3";
import AdmissionTemplate4 from "./pages/forms/AdmissionTemplate4";
import Success from "./pages/Success";

import Dashmadmission from "./pages/Dashmadmission";

import Dashmappmodel2 from './pages/Dashmappmodel2';
import Dashmappmodel2cat from './pages/Dashmappmodel2cat';

import Dashmask1 from './pages/Dashmask1';

import IDCardManager from './pages/IdCardManeger';

import CertificateGenerator from './pages/CertificatesGenerator';


import ExamApplication from './pages/ExamApplication';
import AdminDashboard from './pages/AdminDashboard';
import AdmitCardTemplate from './pages/AdmitCardTemplate';
import ReleaseAdmitCard from './pages/ReleaseAdmitCard';
import DownloadAdmitCard from './pages/DownloadAdmitCard';

import Dashapplyadmitstud from './pages/Dashapplyadmitstud';

import Dashmexamadmit from './pages/Dashmexamadmit';
import Dashmexamadmitadmin from './pages/Dashmexamadmitadmin';
import Dashmfees from './pages/Dashmfees';
import Dashmfeesadmin from './pages/Dashmfeesadmin';
import Dashmledgerstud from './pages/Dashmledgerstud';
import Dashmledgerstudadmin from './pages/Dashmledgerstudadmin';

import Dashmexamadmitstud from './pages/Dashmexamadmitstud';
import Dashmledgerstudstud from './pages/Dashmledgerstudstud';


import DashmUser from './pages/DashmUser';
import DashmUseradmin from './pages/DashmUseradmin';



import CreateLibraryForm from './pages/CreateLibraryForm';
import AdminLibrariesPage from './pages/AdminLibrariesPage';
import LibraryBooksPage from './pages/LibraryBooksPage';
import IssuedBooksPage from './pages/IssuedBookPage';
import LibraryReportPage from './pages/LibraryReportPage';

import Dashlibraryform from './pages/Dashlibraryform';

import Dashadmitdownload from './pages/Dashadmitdownload';

import Studadmitcard from './pages/Studadmitcard';

import HostelBuildingPage from './pages/HostelBuildingPage';
import HostelRoomPage from './pages/HostelRoomPage';

import ApplicationReviewPage from './pages/ApplicationReviewPage';
import DetailedApplicationPage from './pages/DetailedApplicationPage';

import Dashnirfplacement from './pages/Dashnirfplacement';


import TaskManagerPage from './pages/TaskManagerPage';

import Dashinterncomplete from './pages/Dashinterncomplete';

import Dashworkloadn1faculty from './pages/Dashworkloadn1faculty';

import Dashmexammarksall from './pages/Dashmexammarksall';
import Dashmexammarksalladmin from './pages/Dashmexammarksalladmin';

import Dashmarksheet from './pages/Dashmarksheet';

import Studmarksheet from './pages/Studmarksheet';

import Studbonafide from './pages/Studbonafide';
import Studadmission from './pages/Studadmission';

import Report2 from './pages/Report2';
import EventReport from './pages/EventReport';

import Dashalerts from './pages/Dashalerts';

import SetupPage from './pages/SetupPage';
import Dashleavesetup from './pages/Dashleavesetup';
import LeavesPage from './pages/LeavesPage';
import NavigatetoPages from './pages/NavigatetoPages';


import TaskCreatorPage from './pages/TaskCreatorPage';
import TaskAssignToMePage from './pages/TaskAssignToMePage';
import ApproverTasksPage from './pages/ApproverTaskPage';


import FormPage from "./pages/FormPage";
import ResponsePage from "./pages/ResponsePage";
import FillForm from "./pages/FillForm";


import EventsListPage from './pages/EventListPage';
import EventRegisterPage from './pages/EventRegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import ApproveSpeakersPage from './pages/ApproveSpeakersPage';
import EventRegisterPage1 from './pages/EventRegisterationPage1';
import EventsListPage1 from './pages/EventListPage1';

import Dasheventlistpage from './pages/Dasheventlistpage';
import Dashapprovespeakers from './pages/Dashapprovespeakers';


import JobManagerPage from "./pages/JobManagerPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import StudentCVPage from "./pages/StudentCVPage";
import JobApplicationDetailsPage from "./pages/JobApplicationDetailsPage";

import Dashmcompany from "./pages/Dashmcompany";
import Signinpagecompany from "./pages/Signinpagecompany";

import Dashmjobds from './pages/Dashmjobds';
import Dashmjobdsadmin from './pages/Dashmjobdsadmin';
import Dashmjobapplicationds from './pages/Dashmjobapplicationds';
import Dashmjobapplicationdsadmin from './pages/Dashmjobapplicationdsadmin';


import Dashpsectorreport from './pages/Dashpsectorreport';

import Dashpappplaced from './pages/Dashpappplaced';

import Dashmplaced from './pages/Dashmplaced';

import InternalApplicationStatusPage from "./pages/InternalApplicationStatusPage";
import JobApplicationInternalDetailsPage from "./pages/JobApplicationInternalDetailsPage";
import JobManagerInternalPage from "./pages/JobManagerInternalPage";
import JobApplicationInternalPage from "./pages/JobApplicationInternalPage";

import AllCVPage from "./pages/AllCVPage";

import RoutePage from './pages/RoutePage';
import BusPage from './pages/BusPage';
import BusDetailPage from './pages/BusDetailPage';


import DetailedView from "./pages/DetailedView";
import FinalizeData from "./pages/FinalizeData";
import RubricExamPage from "./pages/RubricExamPage";

import StudentProfile from "./pages/StudentProfile";

import StudentProfile1 from "./pages/StudentProfile1";
import Dashstudprofileall from "./pages/Dashstudprofileall";

import Dashmroles from "./pages/Dashmroles";

import ClassManagement from "./pages/ClassManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import EnrollmentManagement from "./pages/EnrollmentManagement";


import Dashmlessonplannew from './pages/Dashmlessonplannew';
import Dashmlessonplannewadmin from './pages/Dashmlessonplannewadmin';

import Dashmserbplan from './pages/Dashmserbplan';
import Dashmserbplanadmin from './pages/Dashmserbplanadmin';

import Dashmserb from './pages/Dashmserb';

import FeedbackManagement from "./pages/FeedbackManagement";
import CreateFeedback from "./pages/CreateFeedback";
import FeedbackFillResponse from "./pages/FeedbackFillResponse";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import FeedbackResponses from "./pages/FeedbackResponses";

import FeedbackInternalManagement from "./pages/FeedbackInternalManagement";
import CreateFeedbackInternal from "./pages/CreateFeedbackInternal";
import FeedbackInternalResponse from "./pages/FeedbackInternalResponse";
import FeedbackInternalAnalytics from "./pages/FeedbackInternalAnalytics";
import FeedbackInternalResponses from "./pages/FeedbackInternalResponses";


import FeedbackInternalManagement1 from './pages/FeedbackInternalManagement1';
import CreateFeedbackInternal1 from './pages/CreateFeedbackInternal1';
import FeedbackInternalResponse1 from './pages/FeedbackInternalResponse1';
import FeedbackInternalResponses1 from './pages/FeedbackInternalResponses1';
import FeedbackInternalAnalytics1 from './pages/FeedbackInternalAnalytics1';


import DetailedView1 from "./pages/DetailedView1";
import FinalizeData1 from "./pages/FinalizeData1";
import RubricExamPage1 from "./pages/RubricExamPage1";

import Dashmmcoatt from "./pages/Dashmmcoatt";

import BreakoutRoomManagement from "./pages/BreakoutRoomManagement";
import StudentBreakoutRoom from "./pages/StudentBreakoutRoom";
import StudentClassView from "./pages/StudentClassView";
import ClassManagement1 from "./pages/ClassManagement1";


import FacultyDashboardds from './pages/FacultyDashboardds';


import Dashdashfacnew from './pages/Dashdashfacnew';


import FacultyTopicPage1ds from "./pages/FacultyTopicPage1ds";
import StudentTopicPage1ds from "./pages/StudentTopicPage1ds";
import DiscussionPostsPage1ds from "./pages/DiscussionPostsPage1ds";
import TopicCategoryPage1ds from "./pages/TopicCategoryPage1ds";


import FacultyTopicPageds from "./pages/FacultyTopicPageds";
import StudentTopicPageds from "./pages/StudentTopicPageds";
import DiscussionPostsPageds from "./pages/DiscussionPostsPageds";

import AttendanceApp from "./AttendanceApp";
import ClassManagementn from "./pages/ClassManagementn";

import Dashboardj from './pages/dashboardj';
import IpManagementPagej from './pages/ipaddressj';

import AttendancePagej from './pages/attendancej';
import AttendanceCalendarj from './pages/allattendancej';
import AttendanceByEmailj from './pages/attendancebyemailj';
import SalaryPagej from './pages/salaryj'; 
import SalarySearchj from './pages/salarybysearchj';

import SalarySlipj from './pages/salaryslipj';
import Deductionj from './pages/deductionj';

import Dashmmacadcal from './pages/Dashmmacadcal';
import Dashmmacadcaladmin from './pages/Dashmmacadcaladmin';
import Dashmmfeescol from './pages/Dashmmfeescol';
import Dashmmfeescoladmin from './pages/Dashmmfeescoladmin';

import Dashmmfeescolbydate from './pages/Dashmmfeescolbydate';
import Dashfeescolaggr from './pages/Dashfeescolaggr';

import PaymentReceipt from './pages/PaymentReceipt';

import Dashmfeespay from './pages/Dashmfeespay';

import Dashchattest from './pages/Dashchattest';

import GenerateInstituteCode from "./pages/GenerateInstituteCode";

import Dashmmjournal1 from './pages/Dashmmjournal1';
import Dashmmjournal1admin from './pages/Dashmmjournal1admin';
import Dashmmtrialbalance1 from './pages/Dashmmtrialbalance1';
import Dashmmtrialbalance1admin from './pages/Dashmmtrialbalance1admin';

// import AccountGroupPage from "./pages/AccountGroupPage";
// import AccountdsPage from "./pages/AccountdsPage";
import Mjournal1Page from "./pages/Mjournal1Page";
// import BulkUploadPage from "./pages/BulkUploadPage";
import Mjournal1ReportPage from "./pages/Mjournal1ReportPage";


import Dashmmjournal2 from './pages/Dashmmjournal2';
import Dashmmjournal2admin from './pages/Dashmmjournal2admin';
import Dashmmtrialbalance2 from './pages/Dashmmtrialbalance2';
import Dashmmtrialbalance2admin from './pages/Dashmmtrialbalance2admin';


import AccountGroupPage from "./pages/AccountGroupPage";
import AccountdsPage from "./pages/AccountdsPage";
import Mjournal2Page from "./pages/Mjournal2Page";
import BulkUploadPage from "./pages/BulkUploadPage";
import Mjournal2ReportPage from "./pages/Mjournal2ReportPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import BalanceSheetPage from "./pages/BalanceSheetPage"; 

import Dashmmtradingaccount from './pages/Dashmmtradingaccount';
import Dashmmtradingaccountadmin from './pages/Dashmmtradingaccountadmin';
import Dashmmplaccount from './pages/Dashmmplaccount';
import Dashmmplaccountadmin from './pages/Dashmmplaccountadmin';
import Dashmmbalancesheet from './pages/Dashmmbalancesheet';
import Dashmmbalancesheetadmin from './pages/Dashmmbalancesheetadmin';


import Dashmmtradinggenerate from './pages/Dashmmtradinggenerate';

import AttendanceNavigation from "./pages/AttendanceNavigation";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendanceRecords from "./pages/AttendanceRecords";
import SalaryManagement from "./pages/SalaryManagement";
import SalarySlips from "./pages/SalarySlips";
import IPManagement from "./pages/IPManagement";
import AttendanceSettings from "./pages/AttendanceSettings";
import AdminAttendanceView from './pages/AdminAttendanceView';


import SetupPageds1 from './pages/SetupPageds1';
import LeavesPageds1 from './pages/LeavesPageds1';

import Addrubric1bulk from './pages/Addrubric1bulk';

import Addrubric1bulkedit from './pages/Addrubric1bulkedit';

import Dashmattstud from './pages/Dashmattstud';


// User Management - Admin
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import EditUserds from "./pages/EditUserds";
import BulkUploadUsers from "./pages/BulkUploadUsers";

// User Management - Student
import StudentProfileds1 from "./pages/StudentProfileds1";

import Dashmchatentry from "./pages/Dashmchatentry";

import SubjectGroupds from './pages/SubjectGroupds';
import StudentSubjectds from './pages/StudentSubjectds';
import SubjectApprovalds from './pages/SubjectApprovalds';

import SubjectLimitConfig from './pages/SubjectLimitConfig';
import SubjectReportds from './pages/SubjectReportds';

import Seatallocator from './pages/Seatallocator';
import Seatallocator1 from './pages/Seatallocator1';
import Seatallocatorm1 from './pages/Seatallocatorm1';

import Seatallocatorm2 from './pages/Seatallocatorm2';
import Seatallocatorm3 from './pages/Seatallocatorm3';
import Seatallocatorm4 from './pages/Seatallocatorm4';
import Seatallocatorm5 from './pages/Seatallocatorm5';

import Seatallocatormds4 from './pages/Seatallocatormds4';


// User Management - Admin
import UserManagementdsoct18 from "./pages/UserManagementdsoct18";
import CreateUserdsoct18 from "./pages/CreateUserdsoct18";
import EditUserdsoct18 from "./pages/EditUserdsoct18";
import BulkUploadUsersdsoct18 from "./pages/BulkUploadUsersdsoct18";

import UserManagementdsnov17 from "./pages/UserManagementdsnov17";
import CreateUserdsnov17 from "./pages/CreateUserdsnov17";
import EditUserdsnov17 from "./pages/EditUserdsnov17";

// User Management - Student
import StudentProfiledsoct18 from "./pages/StudentProfiledsoct18";

import ProfileEditConfigds from "./pages/ProfileEditConfigds";
import ProfileEditLogsds from "./pages/ProfileEditLogsds";
import DataQualityReportds from "./pages/DataQualityReportds";


import Vendormanagementds from "./pages/Vendormanagementds";
import Productmanagementds from "./pages/Productmanagementds";
import Vendorproductmanagementds from "./pages/Vendorproductmanagementds";
import Productrequestds from "./pages/Productrequestds";
import Productrequestadminds from "./pages/Productrequestadminds";
import Purchasemanagementds from "./pages/Purchasemanagementds";
import Paymentmanagementds from "./pages/Paymentmanagementds";


import TransactionrefdsPage from "./pages/TransactionrefdsPage";
import JournalsByGroupdsPage from "./pages/JournalsByGroupdsPage";

import Purchasedsearchds from "./pages/Purchasedsearchds";


import CreateScholarshipDS from './pages/CreateScholarshipDS';
import ApplyScholarshipDS from './pages/ApplyScholarshipDS';
import ScholarshipAdminDS from './pages/ScholarshipAdminDS';

import Dashmstudalloc1 from './pages/Dashmstudalloc1';
import Dashmstudalloc1admin from './pages/Dashmstudalloc1admin';


import Allocatefaculties from './pages/Allocatefaculties';

import Viewmmcevents from './pages/Viewmmcevents';

import ParentDetailsPage from './pages/ParentDetailsPage';
import GatewayPassApprovalPage from './pages/GatewayPassApprovalPage';
import StudentGatewayPassPage from './pages/StudentGatewayPassPage';
import StudentGatewayStatusPage from './pages/StudentGatewayStatusPage';
import ParentApprovalPage from './pages/ParentApprovalPage';
import BuildingStaffConfigPage from './pages/BuildingStaffConfigPage';
import MessPollsPage from './pages/MessPollsPage';
import StudentMealVotePage from './pages/StudentMealVotePage';
import MessApplicationPage from './pages/MessApplicationPage';
import StudentMessApplicationPage from './pages/StudentMessApplicationPage';

import DashboardPageHostel from './pages/DashboardPageHostel';
import Dashboardhostelpagestud from './pages/Dashboardhostelpagestud';

import DashmPatient from './pages/DashmPatient';
import DashmPatientadmin from './pages/DashmPatientadmin';
import Dashmicu from './pages/Dashmicu';
import Dashmicuadmin from './pages/Dashmicuadmin';
import Dashmmicu from './pages/Dashmmicu';
import Dashmmicuadmin from './pages/Dashmmicuadmin';
import Dashmnicu from './pages/Dashmnicu';
import Dashmnicuadmin from './pages/Dashmnicuadmin';
import Dashmhdu from './pages/Dashmhdu';
import Dashmhduadmin from './pages/Dashmhduadmin';
import Dashmward from './pages/Dashmward';
import Dashmwardadmin from './pages/Dashmwardadmin';
import Dashmemergency from './pages/Dashmemergency';
import Dashmemergencyadmin from './pages/Dashmemergencyadmin';
import Dashmnemergency from './pages/Dashmnemergency';
import Dashmnemergencyadmin from './pages/Dashmnemergencyadmin';
import Dashmpadmission from './pages/Dashmpadmission';
import Dashmpadmissionadmin from './pages/Dashmpadmissionadmin';
import Dashmicubed from './pages/Dashmicubed';
import Dashmicubedadmin from './pages/Dashmicubedadmin';
import Dashmmicubed from './pages/Dashmmicubed';
import Dashmmicubedadmin from './pages/Dashmmicubedadmin';
import Dashmnicubed from './pages/Dashmnicubed';
import Dashmnicubedadmin from './pages/Dashmnicubedadmin';
import Dashmhdubed from './pages/Dashmhdubed';
import Dashmhdubedadmin from './pages/Dashmhdubedadmin';
import Dashmwardbed from './pages/Dashmwardbed';
import Dashmwardbedadmin from './pages/Dashmwardbedadmin';
import Dashmerbed from './pages/Dashmerbed';
import Dashmerbedadmin from './pages/Dashmerbedadmin';
import Dashmnerbed from './pages/Dashmnerbed';
import Dashmnerbedadmin from './pages/Dashmnerbedadmin';
import Dashmpadmhistory from './pages/Dashmpadmhistory';
import Dashmpadmhistoryadmin from './pages/Dashmpadmhistoryadmin';
import Dashmpbilling from './pages/Dashmpbilling';
import Dashmpbillingadmin from './pages/Dashmpbillingadmin';

import Dashmpillness from './pages/Dashmpillness';
import Dashmpillnessadmin from './pages/Dashmpillnessadmin';
import Dashmpsurgery from './pages/Dashmpsurgery';
import Dashmpsurgeryadmin from './pages/Dashmpsurgeryadmin';
import Dashmpfamily from './pages/Dashmpfamily';
import Dashmpfamilyadmin from './pages/Dashmpfamilyadmin';
import Dashmpallergies from './pages/Dashmpallergies';
import Dashmpallergiesadmin from './pages/Dashmpallergiesadmin';

import Dashmpconsent from './pages/Dashmpconsent';
import Dashmpconsentadmin from './pages/Dashmpconsentadmin';
import Dashmptreatment from './pages/Dashmptreatment';
import Dashmptreatmentadmin from './pages/Dashmptreatmentadmin';
import Dashmplab from './pages/Dashmplab';
import Dashmplabadmin from './pages/Dashmplabadmin';
import Dashmpimaging from './pages/Dashmpimaging';
import Dashmpimagingadmin from './pages/Dashmpimagingadmin';
import Dashmpdischarge from './pages/Dashmpdischarge';
import Dashmpdischargeadmin from './pages/Dashmpdischargeadmin';

import Viewmmcevmed from './pages/Viewmmcevmed';
import Viewmmcevmeddis from './pages/Viewmmcevmeddis';


import Dashmwcollection from './pages/Dashmwcollection';
import Dashmwcollectionadmin from './pages/Dashmwcollectionadmin';
import Dashmwcolschedule from './pages/Dashmwcolschedule';
import Dashmwcolscheduleadmin from './pages/Dashmwcolscheduleadmin';
import Dashmwdisposal from './pages/Dashmwdisposal';
import Dashmwdisposaladmin from './pages/Dashmwdisposaladmin';
import Dashmwspill from './pages/Dashmwspill';
import Dashmwspilladmin from './pages/Dashmwspilladmin';


import Dashmwbin from './pages/Dashmwbin';
import Dashmwbinadmin from './pages/Dashmwbinadmin';
import Dashmwcolschedule1 from './pages/Dashmwcolschedule1';
import Dashmwcolschedule1admin from './pages/Dashmwcolschedule1admin';
import Dashmwdisposal1 from './pages/Dashmwdisposal1';
import Dashmwdisposal1admin from './pages/Dashmwdisposal1admin';
import Dashmwspill1 from './pages/Dashmwspill1';
import Dashmwspill1admin from './pages/Dashmwspill1admin';


import ExamMarksStructurePageds from "./pages/ExamMarksStructurePageds";
import MarksEntryPageds from "./pages/MarksEntryPageds";
import TabulationRegisterPage from "./pages/TabulationRegisterPage";

import Dashmstudallocf from "./pages/Dashmstudallocf";

import Dashmpcounselnew from './pages/Dashmpcounselnew';
import Dashmpcounselnewadmin from './pages/Dashmpcounselnewadmin';
import Dashmpcounselc from './pages/Dashmpcounselc';
import Dashmpcounselcadmin from './pages/Dashmpcounselcadmin';
import Dashmpmealplan from './pages/Dashmpmealplan';
import Dashmpmealplanadmin from './pages/Dashmpmealplanadmin';
import Dashmpfood from './pages/Dashmpfood';
import Dashmpfoodadmin from './pages/Dashmpfoodadmin';


import Dashmstudalloc1exam from './pages/Dashmstudalloc1exam';

import BulkTabulationRegisterPage from "./pages/BulkTabulationRegisterPage";

import CollegeStudentLedgerReportPageds from "./pages/CollegeStudentLedgerReportPageds";
import StudentLedgerReportPageds from "./pages/StudentLedgerReportPageds";

import LedgerStudPageds from "./pages/LedgerStudPage";

import LedgerInstallmentPageds from "./pages/LedgerInstallmentPageds";

import FacultyRegistrationFormPage from "./pages/FacultyRegistrationFormPage";

import FacultyRegistrationManagementPage from "./pages/FacultyRegistrationManagementPage";
import FacultyBankDetailsPage from "./pages/FacultyBankDetailsPage";


import CreateGrievanceFormds from "./pages/CreateGrievanceFormds";
import AdminGrievanceDashboardds from "./pages/AdminGrievanceDashboardds";
import AssigneeGrievancePageds from "./pages/AssigneeGrievancePageds";
import ManageGrievanceCategoriesds from "./pages/ManageGrievanceCategoriesds";


import CreateGrievanceFormds1 from "./pages/CreateGrievanceFormds1";
import AdminGrievanceDashboardds1 from "./pages/AdminGrievanceDashboardds1";
import AssigneeGrievancePageds1 from "./pages/AssigneeGrievancePageds1";
import ManageGrievanceCategoriesds1 from "./pages/ManageGrievanceCategoriesds1";
import ManageApiKeyds from "./pages/ManageApiKeyds";
import GeminiChatds from "./pages/GeminiChatds";

import TranscriptPageds from "./pages/Transcriptpageds";

import QuestionBankListds from "./pages/QuestionBankListds";
import ManageSectionsds from "./pages/ManageSectionsds";
import ManageQuestionsds from "./pages/ManageQuestionsds";
import ViewEditLogsds from "./pages/ViewEditLogsds";
import GeneratePDFds from "./pages/GeneratePDFds";

import ManageCategoryAssigneeds1 from "./pages/ManageCategoryAssigneeds1";

import ManageCategoryAssigneeds from "./pages/ManageCategoryAssigneeds";

import DashboardSummaryReportds from "./pages/DashboardSummaryReportds";
import CourseFacultyAssignedReportds from "./pages/CourseFacultyAssignedReportds";
import FacultyCourseSummaryReportds from "./pages/FacultyCourseSummaryReportds";
import FacultyOverallSummaryReportds from "./pages/FacultyOverallSummaryReportds";
import CourseCompletionStatusReportds from "./pages/CourseCompletionStatusReportds";
import FacultyCourseStudentDetailsReportds from "./pages/FacultyCourseStudentDetailsReportds";

import Dashmcrmh1 from './pages/Dashmcrmh1';
import Dashmcrmh1admin from './pages/Dashmcrmh1admin';

import ReevaluationApplicationPageds from "./pages/ReevaluationApplicationPageds";
import ExaminerConfigPageds from "./pages/ExaminerConfigPageds";
import ExaminerEvaluationPageds from "./pages/ExaminerEvaluationPageds";

import Dashmexaminerallocate from "./pages/Dashmexaminerallocate";

import Returnmanagementds from "./pages/Returnmanagementds";

import Dashmexamupload from "./pages/Dashmexamupload";

import Dashchattest4 from "./pages/Dashchattest4";

import Dashchattest4d from "./pages/Dashchattest4d";

import Dashmtall from './pages/Dashmtall';
import Dashmtalladmin from './pages/Dashmtalladmin';
import Dashmtfields from './pages/Dashmtfields';
import Dashmtfieldsadmin from './pages/Dashmtfieldsadmin';

import chattest44 from './pages/chattest44';

import Dashmtbcolumnsall from './pages/Dashmtbcolumnsall';
import Dashmtbcolumnsalladmin from './pages/Dashmtbcolumnsalladmin';


import ReevaluationApplicationNewPageds from "./pages/ReevaluationApplicationNewPageds";
import AdminReevaluationManagementPageds from "./pages/AdminReevaluationManagementPageds";
import ExaminerReevaluationEvaluationPageds from "./pages/ExaminerReevaluationEvaluationPageds";
import AdminExaminer3AllocationPageds from "./pages/AdminExaminer3AllocationPageds";


import Dashboardreevalds from "./pages/Dashboardreevalds";

import Dashmtblapi from './pages/Dashmtblapi';
import Dashmtblapiadmin from './pages/Dashmtblapiadmin';

import Dashreports from './pages/Dashreports';
import Dashmwreport1 from './pages/Dashmwreport1';
import Dashmwreport2 from './pages/Dashmwreport2';

import RequestedAttendanceds from './pages/RequestedAttendanceds';
import StudentAttendanceViewds from './pages/StudentAttendanceViewds';
import SupplementaryAttendanceds from './pages/SupplementaryAttendanceds';

// NEW IMPORTS
import AnswerSheetEvaluationListPageds from "./pages/AnswerSheetEvaluationListPageds";
import AnswerSheetEvaluationPageds from "./pages/AnswerSheetEvaluationPageds";
import ReevaluationQuestionWiseViewPageds from "./pages/ReevaluationQuestionWiseViewPageds";
import ReevaluationQuestionWiseEditPageds from "./pages/ReevaluationQuestionWiseEditPageds";
import HostelReport from './pages/HostelReport';

// payment gateway

import Paymentgatewayconfigds from "./pages/Paymentgatewayconfigds";
import Platformchargesds from "./pages/Platformchargesds";
import Couponmanagementds from "./pages/Couponmanagementds";
import Paymentinitiationds from "./pages/Paymentinitiationds";
import Paymenthistoryds from "./pages/Paymenthistoryds";
import Paymentstatusds from "./pages/Paymentstatusds";
import Paymentcallbackds from "./pages/Paymentcallbackds";


import DashboardCrmds from "./pages/DashboardCrmds";
import Categoryds from "./pages/Categoryds";
import Leadsds from "./pages/Leadsds";
import Leaddetailds from "./pages/Leaddetailds";
import Programmasterds from "./pages/Programmasterds";
import Landingpageds from "./pages/Landingpageds";
import Dripcampaignds from "./pages/Dripcampaignds";
import Apikeyds from "./pages/Apikeyds";
import Analyticsds from "./pages/Analyticsds";
import Publiclandingpageds from "./pages/Publiclandingpageds";
import CommunicationSettings from "./pages/CommunicationSettings";
import Sourceds from "./pages/Sourceds";

// Add these imports after other page imports (around line 400+)
import ApiConfig from './pages/ApiConfig';
import ApiChatbot from './pages/ApiChatbot';
import ApiChatbot1 from './pages/ApiChatbot1.jsx';

import DataApiConfig from './pages/DataApiConfigds';
import AiDataManager from './pages/AiDataManager';

// Student Routes

import StudentListds from './pages/StudentListds.jsx';
// AI Workflow Bot - Add these imports
import WorkflowConfigds from './pages/WorkflowConfigds';
import WorkflowChatbotds from './pages/WorkflowChatbotds';

// Add imports
import MarksheetDataEntryPageds from "./pages/MarksheetDataEntryPageds";
import MarksheetGenerationPageds from "./pages/MarksheetGenerationPageds";





















function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<CampusWebsite />} />
        <Route path="/viewcourse1" element={<Viewcourse1 />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learning-management-system" element={<LearningManagementSystem />} />
        <Route path="/naac" element={<NAAC />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/Parct1" element={<Parct1 />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/delete/:id" element={<DeleteUser />} />
        {/* <Route path="/users" element={<Users />} /> */}
        <Route path="/export" element={<ExportUsers />} />
        <Route path="/dashmcas11" element={<Dashmcas11 />} />
        <Route path="/dashmncas11" element={<Dashmncas11 />} />
        <Route path="/dashmncas11admin" element={<Dashmncas11admin />} />
        <Route path="/Login3" element={<Login />} />
        <Route path="/dashmncas12" element={<Dashmncas12 />} />
        <Route path="/dashmncas12admin" element={<Dashmncas12admin />} />


           <Route path="/marksheetdataentryds" element={<MarksheetDataEntryPageds />} />
<Route path="/marksheetgenerationds" element={<MarksheetGenerationPageds />} />

           {/* Student EventList */}
           <Route path="/studentlistds" element={<StudentListds />} />

           {/* AI Workflow Bot Routes */}
<Route path="/workflowconfigds" element={<WorkflowConfigds />} />
<Route path="/workflowchatbotds" element={<WorkflowChatbotds />} />


          {/* AI API upload ROUTES */}
          <Route path="/dataconfig" element={<DataApiConfig />} />
          <Route path="/aidatamanager" element={<AiDataManager />} />
           {/* NEW ROUTES */}
        <Route path="/AnswerSheetEvaluationListPageds" element={<AnswerSheetEvaluationListPageds />} />
        <Route path="/AnswerSheetEvaluationPageds" element={<AnswerSheetEvaluationPageds />} />
        <Route path="/ReevaluationQuestionWiseViewPageds" element={<ReevaluationQuestionWiseViewPageds />} />
        <Route path="/ReevaluationQuestionWiseEditPageds" element={<ReevaluationQuestionWiseEditPageds />} />


        <Route path="/supplementaryattendanceds" element={<SupplementaryAttendanceds />} />
        <Route path="/studentattendanceds" element={<StudentAttendanceViewds />} />
        <Route path="/requestedattendanceds" element={<RequestedAttendanceds />} />

        {/* <Route path="/requestedattendanceds" element={<RequestedAttendanceds />} />
        <Route path="/studentattendanceviewds" element={<StudentAttendanceViewds />} />
        <Route path="/studentattendanceviewds" element={<StudentAttendanceViewds />} /> */}

        <Route path="/dashmwreport2" element={<Dashmwreport2 />} />
        <Route path="/dashreports" element={<Dashreports />} />
        <Route path="/dashmwreport1" element={<Dashmwreport1 />} />

        <Route path="/dashmtblapi" element={<Dashmtblapi />} />
        <Route path="/dashmtblapiadmin" element={<Dashmtblapiadmin />} />


        <Route path="/dashboardreevalds" element={<Dashboardreevalds />} />
        <Route path="/reevaluation-application-new" element={<ReevaluationApplicationNewPageds />} />
        <Route path="/admin-reevaluation-management" element={<AdminReevaluationManagementPageds />} />
        <Route path="/examiner-reevaluation-evaluation" element={<ExaminerReevaluationEvaluationPageds />} />
        <Route path="/admin-examiner3-allocation" element={<AdminExaminer3AllocationPageds />} />

        <Route path="/dashmtbcolumnsall" element={<Dashmtbcolumnsall />} />
        <Route path="/dashmtbcolumnsalladmin" element={<Dashmtbcolumnsalladmin />} />


        <Route path="/chattest44" element={<chattest44 />} />

        <Route path="/dashmtall" element={<Dashmtall />} />
        <Route path="/dashmtalladmin" element={<Dashmtalladmin />} />
        <Route path="/dashmtfields" element={<Dashmtfields />} />
        <Route path="/dashmtfieldsadmin" element={<Dashmtfieldsadmin />} />


        <Route path="/dashchattest4d" element={<Dashchattest4d />} />

        <Route path="/dashchattest4" element={<Dashchattest4 />} />

        <Route path="/dashmexamupload" element={<Dashmexamupload />} />

        <Route path="/returnmanagementds" element={<Returnmanagementds />} />

        <Route path="/dashmexaminerallocate" element={<Dashmexaminerallocate />} />

        <Route path="/reevaluationapplicationds" element={<ReevaluationApplicationPageds />} />
        <Route path="/examinerconfigds" element={<ExaminerConfigPageds />} />
        <Route path="/examinerevaluationds" element={<ExaminerEvaluationPageds />} />

        <Route path="/dashmcrmh1" element={<Dashmcrmh1 />} />
        <Route path="/dashmcrmh1admin" element={<Dashmcrmh1admin />} />


        <Route path="/dashboardsummary" element={<DashboardSummaryReportds />} />
        <Route path="/coursefacultyassigned" element={<CourseFacultyAssignedReportds />} />
        <Route path="/facultycoursesummary" element={<FacultyCourseSummaryReportds />} />
        <Route path="/facultyoverallsummary" element={<FacultyOverallSummaryReportds />} />
        <Route path="/coursecompletionstatus" element={<CourseCompletionStatusReportds />} />
        <Route path="/facultycoursestudentdetails" element={<FacultyCourseStudentDetailsReportds />} />

        <Route path="/managecategoryassigneeds" element={<ManageCategoryAssigneeds />} />

        <Route path="/managecategoryassigneeds1" element={<ManageCategoryAssigneeds1 />} />

          <Route path="/questionbanklistds" element={<QuestionBankListds />} />
        <Route path="/managesectionsds/:questionbankcode" element={<ManageSectionsds />} />
        <Route path="/managequestionsds/:questionbankcode" element={<ManageQuestionsds />} />
        <Route path="/vieweditlogsds/:questionbankcode" element={<ViewEditLogsds />} />
        <Route path="/generatepdfds/:questionbankcode" element={<GeneratePDFds />} />

        <Route path="/transcriptpageds" element={<TranscriptPageds />} />

        
        <Route path="/creategrievanceds1" element={<CreateGrievanceFormds1 />} />
        <Route path="/admingrievancedashboardds1" element={<AdminGrievanceDashboardds1 />} />
        <Route path="/assigneegrievancepageds1" element={<AssigneeGrievancePageds1 />} />
        <Route path="/managegrievancecategoriesds1" element={<ManageGrievanceCategoriesds1 />} />
        <Route path="/manageapikeyds" element={<ManageApiKeyds />} />
        <Route path="/geminichatds" element={<GeminiChatds />} />

         <Route path="/creategrievanceds" element={<CreateGrievanceFormds />} />
        <Route path="/admingrievancedashboardds" element={<AdminGrievanceDashboardds />} />
        <Route path="/assigneegrievancepageds" element={<AssigneeGrievancePageds />} />
        <Route path="/managegrievancecategoriesds" element={<ManageGrievanceCategoriesds />} />

           <Route path="/facultyregistrationform" element={<FacultyRegistrationFormPage />} />

        <Route
          path="/facultyregistrationmanagement"
          element={<FacultyRegistrationManagementPage />}
        />
        <Route path="/facultybankdetails" element={<FacultyBankDetailsPage />} />

        <Route path="/ledgerstudpageds" element={<LedgerStudPageds />} />
        <Route path="/ledgerinstallmentpageds" element={<LedgerInstallmentPageds />} />

         <Route path="/studentledgerreportds" element={<StudentLedgerReportPageds />} />
        <Route path="/collegerepledgerreportds" element={<CollegeStudentLedgerReportPageds />} />

        <Route path="/bulktabulationregisterpageds" element={<BulkTabulationRegisterPage />} />

<Route path="/dashmstudalloc1exam" element={<Dashmstudalloc1exam />} />

        <Route path="/dashmpcounselnew" element={<Dashmpcounselnew />} />
<Route path="/dashmpcounselnewadmin" element={<Dashmpcounselnewadmin />} />
<Route path="/dashmpcounselc" element={<Dashmpcounselc />} />
<Route path="/dashmpcounselcadmin" element={<Dashmpcounselcadmin />} />
<Route path="/dashmpmealplan" element={<Dashmpmealplan />} />
<Route path="/dashmpmealplanadmin" element={<Dashmpmealplanadmin />} />
<Route path="/dashmpfood" element={<Dashmpfood />} />
<Route path="/dashmpfoodadmin" element={<Dashmpfoodadmin />} />


        <Route path="/dashmstudallocf" element={<Dashmstudallocf />} />

         <Route path="/examstructurepageds" element={<ExamMarksStructurePageds />} />
                <Route path="/marksentrypageds" element={<MarksEntryPageds />} />
                <Route path="/tabulationregisterpageds" element={<TabulationRegisterPage />} />

        <Route path="/dashmwbin" element={<Dashmwbin />} />
<Route path="/dashmwbinadmin" element={<Dashmwbinadmin />} />
<Route path="/dashmwcolschedule1" element={<Dashmwcolschedule1 />} />
<Route path="/dashmwcolschedule1admin" element={<Dashmwcolschedule1admin />} />
<Route path="/dashmwdisposal1" element={<Dashmwdisposal1 />} />
<Route path="/dashmwdisposal1admin" element={<Dashmwdisposal1admin />} />
<Route path="/dashmwspill1" element={<Dashmwspill1 />} />
<Route path="/dashmwspill1admin" element={<Dashmwspill1admin />} />


        <Route path="/dashmwcollection" element={<Dashmwcollection />} />
<Route path="/dashmwcollectionadmin" element={<Dashmwcollectionadmin />} />
<Route path="/dashmwcolschedule" element={<Dashmwcolschedule />} />
<Route path="/dashmwcolscheduleadmin" element={<Dashmwcolscheduleadmin />} />
<Route path="/dashmwdisposal" element={<Dashmwdisposal />} />
<Route path="/dashmwdisposaladmin" element={<Dashmwdisposaladmin />} />
<Route path="/dashmwspill" element={<Dashmwspill />} />
<Route path="/dashmwspilladmin" element={<Dashmwspilladmin />} />


<Route path="/viewmmcevmeddis" element={<Viewmmcevmeddis />} />
<Route path="/viewmmcevmed" element={<Viewmmcevmed />} />

        <Route path="/dashmpconsent" element={<Dashmpconsent />} />
<Route path="/dashmpconsentadmin" element={<Dashmpconsentadmin />} />
<Route path="/dashmptreatment" element={<Dashmptreatment />} />
<Route path="/dashmptreatmentadmin" element={<Dashmptreatmentadmin />} />
<Route path="/dashmplab" element={<Dashmplab />} />
<Route path="/dashmplabadmin" element={<Dashmplabadmin />} />
<Route path="/dashmpimaging" element={<Dashmpimaging />} />
<Route path="/dashmpimagingadmin" element={<Dashmpimagingadmin />} />
<Route path="/dashmpdischarge" element={<Dashmpdischarge />} />
<Route path="/dashmpdischargeadmin" element={<Dashmpdischargeadmin />} />


        <Route path="/dashmpillness" element={<Dashmpillness />} />
<Route path="/dashmpillnessadmin" element={<Dashmpillnessadmin />} />
<Route path="/dashmpsurgery" element={<Dashmpsurgery />} />
<Route path="/dashmpsurgeryadmin" element={<Dashmpsurgeryadmin />} />
<Route path="/dashmpfamily" element={<Dashmpfamily />} />
<Route path="/dashmpfamilyadmin" element={<Dashmpfamilyadmin />} />
<Route path="/dashmpallergies" element={<Dashmpallergies />} />
<Route path="/dashmpallergiesadmin" element={<Dashmpallergiesadmin />} />


        <Route path="/dashmPatient" element={<DashmPatient />} />
<Route path="/dashmPatientadmin" element={<DashmPatientadmin />} />
<Route path="/dashmicu" element={<Dashmicu />} />
<Route path="/dashmicuadmin" element={<Dashmicuadmin />} />
<Route path="/dashmmicu" element={<Dashmmicu />} />
<Route path="/dashmmicuadmin" element={<Dashmmicuadmin />} />
<Route path="/dashmnicu" element={<Dashmnicu />} />
<Route path="/dashmnicuadmin" element={<Dashmnicuadmin />} />
<Route path="/dashmhdu" element={<Dashmhdu />} />
<Route path="/dashmhduadmin" element={<Dashmhduadmin />} />
<Route path="/dashmward" element={<Dashmward />} />
<Route path="/dashmwardadmin" element={<Dashmwardadmin />} />
<Route path="/dashmemergency" element={<Dashmemergency />} />
<Route path="/dashmemergencyadmin" element={<Dashmemergencyadmin />} />
<Route path="/dashmnemergency" element={<Dashmnemergency />} />
<Route path="/dashmnemergencyadmin" element={<Dashmnemergencyadmin />} />
<Route path="/dashmpadmission" element={<Dashmpadmission />} />
<Route path="/dashmpadmissionadmin" element={<Dashmpadmissionadmin />} />
<Route path="/dashmicubed" element={<Dashmicubed />} />
<Route path="/dashmicubedadmin" element={<Dashmicubedadmin />} />
<Route path="/dashmmicubed" element={<Dashmmicubed />} />
<Route path="/dashmmicubedadmin" element={<Dashmmicubedadmin />} />
<Route path="/dashmnicubed" element={<Dashmnicubed />} />
<Route path="/dashmnicubedadmin" element={<Dashmnicubedadmin />} />
<Route path="/dashmhdubed" element={<Dashmhdubed />} />
<Route path="/dashmhdubedadmin" element={<Dashmhdubedadmin />} />
<Route path="/dashmwardbed" element={<Dashmwardbed />} />
<Route path="/dashmwardbedadmin" element={<Dashmwardbedadmin />} />
<Route path="/dashmerbed" element={<Dashmerbed />} />
<Route path="/dashmerbedadmin" element={<Dashmerbedadmin />} />
<Route path="/dashmnerbed" element={<Dashmnerbed />} />
<Route path="/dashmnerbedadmin" element={<Dashmnerbedadmin />} />
<Route path="/dashmpadmhistory" element={<Dashmpadmhistory />} />
<Route path="/dashmpadmhistoryadmin" element={<Dashmpadmhistoryadmin />} />
<Route path="/dashmpbilling" element={<Dashmpbilling />} />
<Route path="/dashmpbillingadmin" element={<Dashmpbillingadmin />} />


        <Route path='/dashboardpagehostel' element={<DashboardPageHostel />} />
        <Route path='/dashboardhostelpagestud' element={<Dashboardhostelpagestud />} />
        <Route path='/hostelreport' element={<HostelReport />} />
         {/* Warden Routes - NEW */}
                <Route path='/parent-details' element={<ParentDetailsPage />} />
                <Route path='/gateway-pass-approval' element={<GatewayPassApprovalPage />} />
                <Route path='/building-staff-config' element={<BuildingStaffConfigPage />} />
                <Route path='/mess-polls' element={<MessPollsPage />} />
                <Route path='/mess-applications' element={<MessApplicationPage />} />
                
                {/* Student Routes - NEW */}
                <Route path='/student-gateway-pass' element={<StudentGatewayPassPage />} />
                <Route path='/student-gateway-status' element={<StudentGatewayStatusPage />} />
                <Route path='/student-meal-vote' element={<StudentMealVotePage />} />
                <Route path='/student-mess-application' element={<StudentMessApplicationPage />} />
                
                {/* Parent Routes - NEW */}
                <Route path='/parent-approval/:token' element={<ParentApprovalPage />} />

        <Route path="/viewmmcevents" element={<Viewmmcevents />} />
        <Route path="/allocatefaculties" element={<Allocatefaculties />} />

        <Route path="/dashmstudalloc1" element={<Dashmstudalloc1 />} />
        <Route path="/dashmstudalloc1admin" element={<Dashmstudalloc1admin />} />


         <Route path='/CreateScholarshipDS' element={<CreateScholarshipDS />} />
        <Route path='/ApplyScholarshipDS' element={<ApplyScholarshipDS />} />
        <Route path='/ScholarshipAdminDS' element={<ScholarshipAdminDS />} />

        <Route path="/purchasedsearchds" element={<Purchasedsearchds />} />

        <Route path="/transactionrefds" element={<TransactionrefdsPage />} />
        <Route path="/journalsbygroupds" element={<JournalsByGroupdsPage />} />

         <Route path="/vendormanagementds" element={<Vendormanagementds />} />
        <Route path="/productmanagementds" element={<Productmanagementds />} />
        <Route path="/vendorproductmanagementds" element={<Vendorproductmanagementds />} />
        <Route path="/productrequestds" element={<Productrequestds />} />
        <Route path="/productrequestadminds" element={<Productrequestadminds />} />
        <Route path="/purchasemanagementds" element={<Purchasemanagementds />} />
        <Route path="/paymentmanagementds" element={<Paymentmanagementds />} />

         <Route path="/usermanagementdsoct18" element={<UserManagementdsoct18 />} />
        <Route path="/createuserdsoct18" element={<CreateUserdsoct18 />} />
        <Route path="/edituserdsoct18/:id" element={<EditUserdsoct18 />} />
        <Route path="/bulkuploadusersdsoct18" element={<BulkUploadUsersdsoct18 />} />
        <Route path="/studentprofiledsoct18" element={<StudentProfiledsoct18 />} />
        <Route path="/profileeditconfigds" element={<ProfileEditConfigds />} />
        <Route path="/profileeditlogsds" element={<ProfileEditLogsds />} />
        <Route path="/dataqualityreportds" element={<DataQualityReportds />} />

        <Route path="/usermanagementdsnov17" element={<UserManagementdsnov17 />} />
        <Route path="/createuserdsnov17" element={<CreateUserdsnov17 />} />
        <Route path="/edituserdsnov17/:id" element={<EditUserdsnov17 />} />

        <Route path="/seatallocatormds4" element={<Seatallocatormds4 />} />

        <Route path="/seatallocator" element={<Seatallocator />} />
        <Route path="/seatallocator1" element={<Seatallocator1 />} />
        <Route path="/seatallocatorm1" element={<Seatallocatorm1 />} />
        <Route path="/seatallocatorm2" element={<Seatallocatorm2 />} />
        <Route path="/seatallocatorm3" element={<Seatallocatorm3 />} />
        <Route path="/seatallocatorm4" element={<Seatallocatorm4 />} />
        <Route path="/seatallocatorm5" element={<Seatallocatorm5 />} />

        {/* Faculty Routes */}
        
        <Route path="/subjectlimitconfig" element={<SubjectLimitConfig />} />
        <Route path="/subjectgroupds" element={<SubjectGroupds />} />
        <Route path='/subjectApprovalds' element={<SubjectApprovalds />} />
        <Route path="/subjectreportds" element={<SubjectReportds />} />
        
        {/* Student Route */}
        <Route path='/studentSubjectds' element={<StudentSubjectds />} />

        <Route path="/dashmchatentry" element={<Dashmchatentry />} />

        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/create-user" element={<CreateUser />} />
        <Route path="/admin/edit-user/:id" element={<EditUserds />} />
        <Route path="/admin/bulk-upload-users" element={<BulkUploadUsers />} />
         <Route path="/student/profile" element={<StudentProfileds1 />} />

        <Route path="/dashmattstud" element={<Dashmattstud />} />

        <Route path="/addrubric1bulkedit" element={<Addrubric1bulkedit />} />
        <Route path="/addrubric1bulk" element={<Addrubric1bulk />} />

        <Route path="/setuppageds1" element={<SetupPageds1 />} />
        <Route path="/leavespageds1" element={<LeavesPageds1 />} />

         <Route path="/attendance-navigation" element={<AttendanceNavigation />} />
        <Route path="/attendance-dashboard" element={<AttendanceDashboard />} />
        <Route path="/attendance-records" element={<AttendanceRecords />} />
        <Route path="/salary-management" element={<SalaryManagement />} />
        <Route path="/salary-slips" element={<SalarySlips />} />
        <Route path="/ip-management" element={<IPManagement />} />
        <Route path="/attendance-settings" element={<AttendanceSettings />} />
        <Route path="/admin-attendance" element={<AdminAttendanceView />} />

        <Route path="/dashmmtradinggenerate" element={<Dashmmtradinggenerate />} />

        <Route path="/dashmmtradingaccount" element={<Dashmmtradingaccount />} />
        <Route path="/dashmmtradingaccountadmin" element={<Dashmmtradingaccountadmin />} />
        <Route path="/dashmmplaccount" element={<Dashmmplaccount />} />
        <Route path="/dashmmplaccountadmin" element={<Dashmmplaccountadmin />} />
        <Route path="/dashmmbalancesheet" element={<Dashmmbalancesheet />} />
        <Route path="/dashmmbalancesheetadmin" element={<Dashmmbalancesheetadmin />} />


        <Route path="/dashmmjournal2" element={<Dashmmjournal2 />} />
        <Route path="/dashmmjournal2admin" element={<Dashmmjournal2admin />} />
        <Route path="/dashmmtrialbalance2" element={<Dashmmtrialbalance2 />} />
        <Route path="/dashmmtrialbalance2admin" element={<Dashmmtrialbalance2admin />} />

        <Route path="/accountgroup" element={<AccountGroupPage />} />
        <Route path="/accountds" element={<AccountdsPage />} />
        <Route path="/mjournal2" element={<Mjournal2Page />} />
        <Route path="/bulkuploadpageds" element={<BulkUploadPage />} />
        <Route path="/mjournal2reportpage" element={<Mjournal2ReportPage />} />
        <Route path="/trialbalancepage" element={<TrialBalancePage />} />
        <Route path="/balancesheetpage" element={<BalanceSheetPage />} />


        {/* <Route path="/accountgroup" element={<AccountGroupPage />} />
        <Route path="/accountds" element={<AccountdsPage />} /> */}
        <Route path="/mjournal1" element={<Mjournal1Page />} />
        {/* <Route path="/bulk-upload" element={<BulkUploadPage />} /> */}
        <Route path="/reports" element={<Mjournal1ReportPage />} />

        <Route path="/dashmmjournal1" element={<Dashmmjournal1 />} />
        <Route path="/dashmmjournal1admin" element={<Dashmmjournal1admin />} />
        <Route path="/dashmmtrialbalance1" element={<Dashmmtrialbalance1 />} />
        <Route path="/dashmmtrialbalance1admin" element={<Dashmmtrialbalance1admin />} />


        <Route path="/generateinstitutecode" element={<GenerateInstituteCode />} />
        <Route path="/dashchattest" element={<Dashchattest />} />

        <Route path="/paymentreceipt" element={<PaymentReceipt />} />
        <Route path="/dashmfeespay" element={<Dashmfeespay />} />
        

        <Route path="/dashmmfeescolbydate" element={<Dashmmfeescolbydate />} />
        <Route path="/dashfeescolaggr" element={<Dashfeescolaggr />} />
        

        <Route path="/dashmmacadcal" element={<Dashmmacadcal />} />
        <Route path="/dashmmacadcaladmin" element={<Dashmmacadcaladmin />} />
        <Route path="/dashmmfeescol" element={<Dashmmfeescol />} />
        <Route path="/dashmmfeescoladmin" element={<Dashmmfeescoladmin />} />


         <Route path="/dashboardj" element={<Dashboardj />} /> 
        <Route path="/allattendancej" element={<AttendanceCalendarj />} />
        <Route path="/attendancebyemailj" element={<AttendanceByEmailj />} />
        <Route path="/attendancej" element={<AttendancePagej />} />
        <Route path="/ipaddressj" element={<IpManagementPagej />} />
        <Route path="/salaryj" element={<SalaryPagej />} />
        <Route path="/salarybysearchj" element={<SalarySearchj />} />
        
        <Route path="/salaryslipj" element={<SalarySlipj />} />
        <Route path="/deductionj" element={<Deductionj/>} />

        <Route path="/attendance/*" element={<AttendanceApp />} />
        <Route path="/classesn" element={<ClassManagementn />} />


        <Route path="/facultytopicpage1ds/:categoryName" element={<FacultyTopicPage1ds />} />
        <Route path="/studenttopicpage1ds" element={<StudentTopicPage1ds />} />
        <Route path="/discussionpostspage1ds/:topicId" element={<DiscussionPostsPage1ds />} />

         {/* <Route path="/dashboardj" element={<Dashboardj />} /> 
        <Route path="/allattendancej" element={<AttendanceCalendar />} />
        <Route path="/attendancebyemailj" element={<AttendanceByEmail />} />
        <Route path="/attendancej" element={<AttendancePage />} />
        <Route path="/ipaddressj" element={<IpManagementPage />} />
        <Route path="/salaryj" element={<SalaryPage />} />
        <Route path="/salarybysearchj" element={<SalarySearch />} />
        <Route path="/salaryslipj" element={<SalarySlip />} />
        <Route path="/deductionj" element={<Deduction/>} /> */}

        <Route path="/topiccategorypage1ds" element={<TopicCategoryPage1ds />} />

         <Route path="/facultytopicpageds" element={<FacultyTopicPageds />} />
         <Route path="/studenttopicpageds" element={<StudentTopicPageds />} />
         <Route path="/discussionpostspageds/:topicId" element={<DiscussionPostsPageds />} />

        <Route path="/dashdashfacnew" element={<Dashdashfacnew />} />
         <Route path="/facultydashboardds" element={<FacultyDashboardds />} />

        <Route path="/classes1" element={<ClassManagement1 />} />
        <Route path="/breakout-rooms" element={<BreakoutRoomManagement />} />
        <Route path="/student-breakout-room/:roomid" element={<StudentBreakoutRoom />} />
        <Route path="/studentclassview" element={<StudentClassView />} />

        <Route path="/dashmmcoatt" element={<Dashmmcoatt />} />

        <Route path="/rubricexampage1" element={<RubricExamPage1 />} />
        <Route path="/detailedview1/:id" element={<DetailedView1 />} />
        <Route path="/finalizedata1" element={<FinalizeData1 />} />

         <Route path="/feedbackinternalmanagement1" element={<FeedbackInternalManagement1 />} />
        <Route path="/createfeedbackinternal1" element={<CreateFeedbackInternal1 />} />
        {/* ✅ Same component handles editing when feedbackId is provided */}
        <Route path="/editfeedbackinternal1/:feedbackId" element={<CreateFeedbackInternal1 />} />
        <Route path="/feedbackinternalresponse1/:feedbackId" element={<FeedbackInternalResponse1 />} />
        <Route path="/feedbackinternalresponses1/:feedbackId" element={<FeedbackInternalResponses1 />} />
        <Route path="/feedbackinternalanalytics1/:feedbackId" element={<FeedbackInternalAnalytics1 />} />

         <Route path="/feedbackinternalmanagement" element={<FeedbackInternalManagement />} />
        <Route path="/createfeedbackinternal" element={<CreateFeedbackInternal />} />
        {/* ✅ Same component handles editing when feedbackId is provided */}
        <Route path="/editfeedbackinternal/:feedbackId" element={<CreateFeedbackInternal />} />
        <Route path="/feedbackinternalresponse/:feedbackId" element={<FeedbackInternalResponse />} />
        <Route path="/feedbackinternalresponses/:feedbackId" element={<FeedbackInternalResponses />} />
        <Route path="/feedbackinternalanalytics/:feedbackId" element={<FeedbackInternalAnalytics />} />

        <Route path="/feedbackmanagement" element={<FeedbackManagement />} />
        <Route path="/createfeedback" element={<CreateFeedback />} />
        <Route path="/createfeedback/edit/:feedbackId" element={<CreateFeedback />} />
        <Route path="/feedbackfillresponse/:feedbackId" element={<FeedbackFillResponse />} />
        <Route path="/feedbackresponses/:feedbackId" element={<FeedbackResponses />} />
        <Route path="/feedbackanalytic/:feedbackId" element={<FeedbackAnalytics />} />

        <Route path="/dashmserb" element={<Dashmserb />} />

        <Route path="/dashmserbplan" element={<Dashmserbplan />} />
        <Route path="/dashmserbplanadmin" element={<Dashmserbplanadmin />} />


        <Route path="/dashmlessonplannew" element={<Dashmlessonplannew />} />
        <Route path="/dashmlessonplannewadmin" element={<Dashmlessonplannewadmin />} />


        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/enrollment" element={<EnrollmentManagement />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        {/* <Route path="/attendance/*" element={<AttendanceApp />} />
        <Route path="/classesn" element={<ClassManagementn />} /> */}

        <Route path="/dashmroles" element={<Dashmroles />} />

        <Route path="/dashstudprofileall" element={<Dashstudprofileall />} />
        <Route path="/studentprofile1" element={<StudentProfile1 />} />
        <Route path="/studentprofile" element={<StudentProfile />} />

        <Route path="/mainrubric" element={<RubricExamPage />} />
        <Route path="/detail/:id" element={<DetailedView />} />
        <Route path="/finalize" element={<FinalizeData />} />

         <Route path='/route' element={<RoutePage />} />
         <Route path='/busesbyroute/:routeId' element={<BusPage />} />
         <Route path='/bus-detail/:busId' element={<BusDetailPage />} />

        
        <Route path="/allcvpage" element={<AllCVPage />} />

         <Route path="/internal/jobmanager" element={<JobManagerInternalPage />} />
        <Route path="/internal/jobapplication/:colid" element={<JobApplicationInternalPage />} />
        <Route path="/internal/jobapplicationstatus/:jobid" element={<InternalApplicationStatusPage />} />
        <Route path="/internal/applicationdetail/:id" element={<JobApplicationInternalDetailsPage />} />

        <Route path="/dashmplaced" element={<Dashmplaced />} />

        <Route path="/dashpappplaced" element={<Dashpappplaced />} />
        <Route path="/dashpsectorreport" element={<Dashpsectorreport />} />

        <Route path="/dashmjobds" element={<Dashmjobds />} />
        <Route path="/dashmjobdsadmin" element={<Dashmjobdsadmin />} />
        <Route path="/dashmjobapplicationds" element={<Dashmjobapplicationds />} />
        <Route path="/dashmjobapplicationdsadmin" element={<Dashmjobapplicationdsadmin />} />


        <Route path="/dashmcompany" element={<Dashmcompany />} />
        <Route path="/logincompany" element={<Signinpagecompany />} />

         <Route path="/jobmanager" element={<JobManagerPage />} />
        <Route path="/jobs-apply" element={<JobApplicationPage />} />
        <Route  path="/applications-status/:jobid"  element={<ApplicationStatusPage />} />
        <Route path="/studentcv" element={<StudentCVPage />} />
        <Route path="/application-detail/:id"  element={<JobApplicationDetailsPage />}/>

         <Route path='/dasheventlistpage' element={<Dasheventlistpage />} />
         <Route path='/dashapprovespeakers' element={<Dashapprovespeakers />} />

         <Route path='/eventslist' element={<EventsListPage />} />
         <Route path="/event/:id/register" element={<EventRegisterPage />} />
         <Route path="/event/:id/:colid" element={<EventDetailPage />} />
         <Route path="/event/:id/approvespeakers" element={<ApproveSpeakersPage />} />
         <Route path="/eventregistrationcolid/:id/:colid" element ={<EventRegisterPage1 />} />
         <Route path='/eventlistwithcolid/:colid' element={<EventsListPage1 />} />

         <Route path="/forms" element={<FormPage />} />
        <Route path="/responses/:formId" element={<ResponsePage />} />
        <Route path="/fill/:formId" element={<FillForm />} />

        <Route path="/taskcreatorpage" element = {<TaskCreatorPage />} />
         <Route path='/assigneetaskpage' element={<TaskAssignToMePage />} />
         <Route path='/approvertaskpage' element = {<ApproverTasksPage />} />

         <Route path='/dashleavesetup' element ={<Dashleavesetup />} />
         <Route path='/navigatetopage' element ={<NavigatetoPages />} />
         <Route path='/setuppage' element = {<SetupPage />} />
         <Route path='/leavespage' element = {<LeavesPage />} />


        <Route path='/dashalerts' element = {<Dashalerts />} />

        <Route path='/report2' element = {<Report2 />} />
        <Route path = "/eventreport" element = {<EventReport />} />

        <Route path="/studadmission" element={<Studadmission />} />
        <Route path="/studbonafide" element={<Studbonafide />} />
        <Route path="/studmarksheet" element={<Studmarksheet />} />
        <Route path="/dashmarksheet" element={<Dashmarksheet />} />

        <Route path="/dashmexammarksall" element={<Dashmexammarksall />} />
        <Route path="/dashmexammarksalladmin" element={<Dashmexammarksalladmin />} />


        <Route path='/dashworkloadn1faculty' element={<Dashworkloadn1faculty />} />

        <Route path='/dashinterncomplete' element={<Dashinterncomplete />} />
        <Route path='/taskmanager' element={<TaskManagerPage />} />

        <Route path='/dashnirfplacement' element={<Dashnirfplacement />} />

        <Route path='/applicationreviewpage' element={<ApplicationReviewPage />} />
        <Route path='/application/:id' element={<DetailedApplicationPage />} />

        <Route path='/hostelbuldingmanager' element = {< HostelBuildingPage />} />
        <Route path='/rooms/:buildingname' element = {<HostelRoomPage />} />

        <Route path='/studadmitcard' element={<Studadmitcard />} />
        <Route path='/dashadmitdownload' element={<Dashadmitdownload />} />
        <Route path='/dashlibraryform' element={<Dashlibraryform />} />

         {/* <Route path='/login' element = {<LoginPage />}/> */}
        <Route path='/createlibraryform' element={<CreateLibraryForm />} />
        <Route path='/admin/libraries' element ={<AdminLibrariesPage />} />
        <Route path="/library/:id" element={<LibraryBooksPage />} />
        <Route path="/library/:id/issuedbooks" element={<IssuedBooksPage />} />
        <Route path="/library/:id/report" element={<LibraryReportPage />} />

        <Route path="/dashmuser" element={<DashmUser />} />
        <Route path="/dashmuseradmin" element={<DashmUseradmin />} />


        <Route path="/dashmexamadmitstud" element={<Dashmexamadmitstud />} />
        <Route path="/dashmledgerstudstud" element={<Dashmledgerstudstud />} />


        <Route path="/dashmexamadmit" element={<Dashmexamadmit />} />
        <Route path="/dashmexamadmitadmin" element={<Dashmexamadmitadmin />} />
        <Route path="/dashmfees" element={<Dashmfees />} />
        <Route path="/dashmfeesadmin" element={<Dashmfeesadmin />} />
        <Route path="/dashmledgerstud" element={<Dashmledgerstud />} />
        <Route path="/dashmledgerstudadmin" element={<Dashmledgerstudadmin />} />


        <Route path='/dashapplyadmitstud' element={<Dashapplyadmitstud />} />
        <Route path='/examapplicationform' element={<ExamApplication />} />
        <Route path='/approvesubjects' element={<AdminDashboard />} />
        <Route path='/admitcardtemplate' element={<AdmitCardTemplate />} />
        <Route path='/releaseadmitcard' element={<ReleaseAdmitCard />} />
        <Route path='/downloadadmitcard' element={<DownloadAdmitCard />} />

        <Route path='/createcertificates' element={<CertificateGenerator />} />

        <Route path='/idcardmanager' element={<IDCardManager />} />
        <Route path="/dashmask1" element={<Dashmask1 />} />

        <Route path="/dashmappmodel2cat" element={<Dashmappmodel2cat />} />
        <Route path="/dashmappmodel2" element={<Dashmappmodel2 />} />
        <Route path="/dashmadmission" element={<Dashmadmission />} />

         <Route path="/admissionform1/:colId" element={<AdmissionTemplate1 />} />
        <Route path="/admissionform2/:colId" element={<AdmissionTemplate2 />} />
        <Route path="/admissionform3/:colId" element={<AdmissionTemplate3 />} />
        <Route path="/admissionform4/:colId" element={<AdmissionTemplate4 />} />
        <Route path="/success" element={<Success />} />

        <Route path="/dashmfacwcal" element={<Dashmfacwcal />} />
        <Route path="/dashmfacwcaladmin" element={<Dashmfacwcaladmin />} />


        <Route path="/dashmtimeslotsn" element={<Dashmtimeslotsn />} />
        <Route path="/dashmtimeslotsnadmin" element={<Dashmtimeslotsnadmin />} />
        <Route path="/dashmworkloadn" element={<Dashmworkloadn />} />
        <Route path="/dashmworkloadnadmin" element={<Dashmworkloadnadmin />} />

        <Route path="/dashmtimeslotsn1" element={<Dashmtimeslotsn1 />} />
        <Route path="/dashmtimeslotsn1admin" element={<Dashmtimeslotsn1admin />} />
        <Route path="/dashmworkloadn1" element={<Dashmworkloadn1 />} />
        <Route path="/dashmworkloadn1admin" element={<Dashmworkloadn1admin />} />



        <Route path="/dashmmstudentprofile" element={<Dashmmstudentprofile />} />
        <Route path="/dashmnallaccrgroup" element={<Dashmnallaccrgroup />} />

        <Route path="/dashmngroup" element={<Dashmngroup />} />
        <Route path="/dashmngroupadmin" element={<Dashmngroupadmin />} />
        <Route path="/dashmngrouppages" element={<Dashmngrouppages />} />
        <Route path="/dashmngrouppagesadmin" element={<Dashmngrouppagesadmin />} />
        <Route path="/dashmngroupaccr" element={<Dashmngroupaccr />} />
        <Route path="/dashmngroupaccradmin" element={<Dashmngroupaccradmin />} />


        <Route path="/dashmattyear" element={<Dashmattyear />} />
        <Route path="/dashmattyearadmin" element={<Dashmattyearadmin />} />


        <Route path="/dashmmfaccoursesatto" element={<Dashmmfaccoursesatto />} />
        <Route path="/dashmnn76" element={<Dashmnn76 />} />
        <Route path="/dashmnn76admin" element={<Dashmnn76admin />} />
        <Route path="/dashmnn781" element={<Dashmnn781 />} />
        <Route path="/dashmnn781admin" element={<Dashmnn781admin />} />
        <Route path="/dashmnn82" element={<Dashmnn82 />} />
        <Route path="/dashmnn82admin" element={<Dashmnn82admin />} />
        <Route path="/dashmnn83" element={<Dashmnn83 />} />
        <Route path="/dashmnn83admin" element={<Dashmnn83admin />} />
        <Route path="/dashmnn84" element={<Dashmnn84 />} />
        <Route path="/dashmnn84admin" element={<Dashmnn84admin />} />
        <Route path="/dashmnn86" element={<Dashmnn86 />} />
        <Route path="/dashmnn86admin" element={<Dashmnn86admin />} />
        <Route path="/dashmnn87" element={<Dashmnn87 />} />
        <Route path="/dashmnn87admin" element={<Dashmnn87admin />} />
        <Route path="/dashmnn96" element={<Dashmnn96 />} />
        <Route path="/dashmnn96admin" element={<Dashmnn96admin />} />
        <Route path="/dashmnn97" element={<Dashmnn97 />} />
        <Route path="/dashmnn97admin" element={<Dashmnn97admin />} />
        <Route path="/dashmnn98" element={<Dashmnn98 />} />
        <Route path="/dashmnn98admin" element={<Dashmnn98admin />} />


        <Route path="/dashmnn61" element={<Dashmnn61 />} />
        <Route path="/dashmnn61admin" element={<Dashmnn61admin />} />
        <Route path="/dashmnn62" element={<Dashmnn62 />} />
        <Route path="/dashmnn62admin" element={<Dashmnn62admin />} />
        <Route path="/dashmnn6clubs" element={<Dashmnn6clubs />} />
        <Route path="/dashmnn6clubsadmin" element={<Dashmnn6clubsadmin />} />


        <Route path="/dashmnallaccrans" element={<Dashmnallaccrans />} />
        <Route path="/dashmnallaccransadmin" element={<Dashmnallaccransadmin />} />


        <Route path="/electricalmachinelab" element={<ElectricalMachineLab />} />

        <Route path="/dashmqualall" element={<Dashmqualall />} />

        <Route path="/dashmnn51" element={<Dashmnn51 />} />
        <Route path="/dashmnn51admin" element={<Dashmnn51admin />} />
        <Route path="/dashmnn52" element={<Dashmnn52 />} />
        <Route path="/dashmnn52admin" element={<Dashmnn52admin />} />
        <Route path="/dashmnn53passp" element={<Dashmnn53passp />} />
        <Route path="/dashmnn53passpadmin" element={<Dashmnn53passpadmin />} />
        <Route path="/dashmnn53obe" element={<Dashmnn53obe />} />
        <Route path="/dashmnn53obeadmin" element={<Dashmnn53obeadmin />} />
        <Route path="/dashmnn54" element={<Dashmnn54 />} />
        <Route path="/dashmnn54admin" element={<Dashmnn54admin />} />
        <Route path="/dashmnn53examdays" element={<Dashmnn53examdays />} />
        <Route path="/dashmnn53examdaysadmin" element={<Dashmnn53examdaysadmin />} />
        <Route path="/dashmnn55" element={<Dashmnn55 />} />
        <Route path="/dashmnn55admin" element={<Dashmnn55admin />} />
        <Route path="/dashmnn56" element={<Dashmnn56 />} />
        <Route path="/dashmnn56admin" element={<Dashmnn56admin />} />

        <Route path="/dashmnallaccr" element={<Dashmnallaccr />} />
        <Route path="/dashmnallaccradmin" element={<Dashmnallaccradmin />} />



        <Route path="/dashmnn33a" element={<Dashmnn33a />} />
        <Route path="/dashmnn33aadmin" element={<Dashmnn33aadmin />} />
        <Route path="/dashmnn33b" element={<Dashmnn33b />} />
        <Route path="/dashmnn33badmin" element={<Dashmnn33badmin />} />
        <Route path="/dashmnn36" element={<Dashmnn36 />} />
        <Route path="/dashmnn36admin" element={<Dashmnn36admin />} />
        <Route path="/dashmnn46" element={<Dashmnn46 />} />
        <Route path="/dashmnn46admin" element={<Dashmnn46admin />} />
        <Route path="/dashmnn35" element={<Dashmnn35 />} />
        <Route path="/dashmnn35admin" element={<Dashmnn35admin />} />


        <Route path="/dashmnn211a" element={<Dashmnn211a />} />
        <Route path="/dashmnn211aadmin" element={<Dashmnn211aadmin />} />
        <Route path="/dashmnn211b" element={<Dashmnn211b />} />
        <Route path="/dashmnn211badmin" element={<Dashmnn211badmin />} />
        <Route path="/dashmnn22" element={<Dashmnn22 />} />
        <Route path="/dashmnn22admin" element={<Dashmnn22admin />} />
        <Route path="/dashmnn23" element={<Dashmnn23 />} />
        <Route path="/dashmnn23admin" element={<Dashmnn23admin />} />
        <Route path="/dashmnn244" element={<Dashmnn244 />} />
        <Route path="/dashmnn244admin" element={<Dashmnn244admin />} />
        <Route path="/dashmnn26" element={<Dashmnn26 />} />
        <Route path="/dashmnn26admin" element={<Dashmnn26admin />} />
        <Route path="/dashmnn25" element={<Dashmnn25 />} />
        <Route path="/dashmnn25admin" element={<Dashmnn25admin />} />
        <Route path="/dashmnn31" element={<Dashmnn31 />} />
        <Route path="/dashmnn31admin" element={<Dashmnn31admin />} />
        <Route path="/dashmnn32" element={<Dashmnn32 />} />
        <Route path="/dashmnn32admin" element={<Dashmnn32admin />} />


        <Route path="/dashmnn11" element={<Dashmnn11 />} />
        <Route path="/dashmnn11admin" element={<Dashmnn11admin />} />
        <Route path="/dashmnn12" element={<Dashmnn12 />} />
        <Route path="/dashmnn12admin" element={<Dashmnn12admin />} />
        <Route path="/dashmnn14" element={<Dashmnn14 />} />
        <Route path="/dashmnn14admin" element={<Dashmnn14admin />} />
        <Route path="/dashmnn15" element={<Dashmnn15 />} />
        <Route path="/dashmnn15admin" element={<Dashmnn15admin />} />
        <Route path="/dashmnn17" element={<Dashmnn17 />} />
        <Route path="/dashmnn17admin" element={<Dashmnn17admin />} />
        <Route path="/dashmnn16" element={<Dashmnn16 />} />
        <Route path="/dashmnn16admin" element={<Dashmnn16admin />} />


        <Route path="/Dashtest1" element={<Dashtest1 />} />
        <Route path="/GreenAudit" element={<GreenAudit />} />
        <Route path="/AcademicAuditInfo" element={<AAaudit />} />
        <Route path="/SeedTest1" element={<SeedTest1 />} />
        <Route path="/Courseall" element={<Courseall />} />
        <Route path="/Internselect" element={<Internselect />} />
        <Route path="/Internall" element={<Internall />} />
        <Route path="/SignupAdmin" element={<SignupAdmin />} />
        <Route path="/campuspricing" element={<CampusPricing />} />
        <Route path="/viewmpricing" element={<Viewmpricing />} />
        <Route path="/dashmbtrialb" element={<Dashmbtrialb />} />
        <Route path="/dashmbtrialbadmin" element={<Dashmbtrialbadmin />} />
        <Route path="/dashmbfacyear" element={<Dashmbfacyear />} />
        <Route path="/dashmbfacyearadmin" element={<Dashmbfacyearadmin />} />
        <Route path="/dashmstudlist" element={<Dashmstudlist />} />
        <Route path="/dashmstudlistadmin" element={<Dashmstudlistadmin />} />


        <Route path="/dashmbmou" element={<Dashmbmou />} />
        <Route path="/dashmbmouadmin" element={<Dashmbmouadmin />} />

        
        <Route path="/viewminterns" element={<Viewminterns />} />
        <Route path="/viewmusers" element={<Viewmusers />} />
        <Route path="/viewmallclients" element={<Viewmallclients />} />
        <Route path="/dashmmiscorenew" element={<Dashmmiscorenew />} />
        <Route path="/dashmminewm" element={<Dashmminewm />} />
        <Route path="/dashmminewmadmin" element={<Dashmminewmadmin />} />
        <Route path="/dashmmisessions" element={<Dashmmisessions />} />
        <Route path="/dashmmisessionsadmin" element={<Dashmmisessionsadmin />} />
        <Route path="/dashmmiseenrol1" element={<Dashmmiseenrol1 />} />
        <Route path="/dashmmiseenrol1admin" element={<Dashmmiseenrol1admin />} />
        <Route path="/dashmmisections1" element={<Dashmmisections1 />} />
        <Route path="/dashmmisections1admin" element={<Dashmmisections1admin />} />
        <Route path="/dashmmiqnew" element={<Dashmmiqnew />} />
        <Route path="/dashmmiqnewadmin" element={<Dashmmiqnewadmin />} />



        <Route path="/viewmindmap" element={<Viewmindmap2 />} />
        <Route path="/dashmmindmaplist" element={<Dashmmindmaplist />} />
        <Route path="/dashmmindmaplistadmin" element={<Dashmmindmaplistadmin />} />
        <Route path="/dashmmindmapedges" element={<Dashmmindmapedges />} />
        <Route path="/dashmmindmapedgesadmin" element={<Dashmmindmapedgesadmin />} />
        <Route path="/dashmmindmapnodes" element={<Dashmmindmapnodes />} />
        <Route path="/dashmmindmapnodesadmin" element={<Dashmmindmapnodesadmin />} />


        <Route path="/dashmreactflow1" element={<Dashmreactflow1 />} />
        <Route path="/viewmreactflow1" element={<Viewmreactflow1 />} />
        <Route path="/deleteaccount" element={<Deleteaccount />} />
        <Route path="/dashmtestscoresnewall" element={<Dashmtestscoresnewall />} />
        
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/signinpay" element={<Signinpay />} />

        <Route path="/campustalentregister1" element={<CampusTalentRegister1 />} />

        <Route path="/dashmonlinepay" element={<Dashmonlinepay />} />
        <Route path="/dashmonlinepayadmin" element={<Dashmonlinepayadmin />} />


        <Route path="/campustalentregister" element={<CampusTalentRegister />} />

        <Route path="/dashmmctalentreg" element={<Dashmmctalentreg />} />
        <Route path="/dashmmctalentregadmin" element={<Dashmmctalentregadmin />} />
        <Route path="/dashmmtestqnewcs" element={<Dashmmtestqnewcs />} />
        <Route path="/dashmmtestqnewcsadmin" element={<Dashmmtestqnewcsadmin />} />
        <Route path="/dashmmguides" element={<Dashmmguides />} />
        <Route path="/dashmmguidesadmin" element={<Dashmmguidesadmin />} />


        <Route path="/dashmtestscorenew" element={<Dashmtestscorenew />} />
        <Route path="/campustalent" element={<CampusTalent1 />} />
        <Route path="/dashmmtestsections1" element={<Dashmmtestsections1 />} />
        <Route path="/dashmmtestsections1admin" element={<Dashmmtestsections1admin />} />
        <Route path="/dashmmtestseenrol1" element={<Dashmmtestseenrol1 />} />
        <Route path="/dashmmtestseenrol1admin" element={<Dashmmtestseenrol1admin />} />



        <Route path="/dashmmtestnewm" element={<Dashmmtestnewm />} />
        <Route path="/dashmmtestnewmadmin" element={<Dashmmtestnewmadmin />} />
        <Route path="/dashmmtestsessions" element={<Dashmmtestsessions />} />
        <Route path="/dashmmtestsessionsadmin" element={<Dashmmtestsessionsadmin />} />
        <Route path="/dashmmtestseenrol" element={<Dashmmtestseenrol />} />
        <Route path="/dashmmtestseenroladmin" element={<Dashmmtestseenroladmin />} />
        <Route path="/dashmmtestqnew" element={<Dashmmtestqnew />} />
        <Route path="/dashmmtestqnewadmin" element={<Dashmmtestqnewadmin />} />
        <Route path="/dashmmtestsections" element={<Dashmmtestsections />} />
        <Route path="/dashmmtestsectionsadmin" element={<Dashmmtestsectionsadmin />} />


        {/* <Route path="/mazegen" element={<MazeGen />} /> */}
        <Route path="/ultimatebattlegame" element={<UltimateBattleGame />} />
        <Route path="/sudokugame" element={<SudokuGame />} />
        <Route path="/towerofhanoi" element={<TowerOfHanoi />} />
        {/* <Route path="/dicegame" element={<DiceGame />} /> */}
        <Route path="/tetrisgame" element={<TetrisGame />} />
        <Route path="/finddiff" element={<FindDiff />} />
        <Route path="/racegame" element={<RaceGame />} />
        <Route path="/wordguessing" element={<WordGuessing />} />
        <Route path="/imgpuzzle" element={<ImgPuzzle />} />
        <Route path="/pacmangame" element={<PacManGame />} />
        <Route path="/betteraimgame" element={<BetterAimGame2 />} />

        <Route path="/dashmstudquota" element={<Dashmstudquota />} />
        <Route path="/dashmstudcategory" element={<Dashmstudcategory />} />
        <Route path="/dashmstudgender" element={<Dashmstudgender />} />
        <Route path="/notgategame" element={<NOTGateGame />} />
        {/* <Route path="/opticalfibregame" element={<OpticalFibreGame />} /> */}
        <Route path="/orgategame" element={<ORGateGame />} />
        {/* <Route path="/resistorgame" element={<ResistorGame />} /> */}
        <Route path="/skeletonexpgame" element={<SkeletonExpGame />} />
        {/* <Route path="/skeletonexppart2game" element={<SkeletonExpPart2Game />} /> */}
        <Route path="/stefanslawgame" element={<StefansLawGame />} />
        <Route path="/subhalfadder1game" element={<SubHalfAdder1Game />} />
        <Route path="/xnorgategame" element={<XNORGateGame />} />
        <Route path="/xorgategame" element={<XORGateGame />} />

        <Route path="/norgategame" element={<NORGateGame />} />
        <Route path="/nandgategame" element={<NANDGateGame />} />
        <Route path="/andgategame" element={<ANDGateGame />} />
        <Route path="/bitserialgame" element={<BitSerialGame />} />
        <Route path="/fingerprintpatterngames" element={<FingerPrintPatternsGame />} />


        <Route path="/bcdtoexcessgames" element={<BCDToExcessConverterGame />} />
        <Route path="/halfsubcircuitverifygame" element={<HalfSubCircuitVerifyGame />} />
        {/* <Route path="/binarytograygames" element={<BinaryToGrayConverterGame />} />
        <Route path="/dcshuntgames" element={<DCShuntMotorSimulationGame />} /> */}
        <Route path="/fullsubcircuitverifygame" element={<FullSubCircuitVerifyGame />} />
        <Route path="/fullsubtractorcircuitgame" element={<FullSubtractorCircuitGame />} />
        <Route path="/graytobinaryconvertedgame" element={<GrayToBinaryConverterGame />} />
        <Route path="/halfsubtractorcircuitgame" element={<HalfSubtractorCircuitGame />} />


        <Route path="/paymentgatewayconfigds" element={<Paymentgatewayconfigds />} />
        <Route path="/platformchargesds" element={<Platformchargesds />} />
        <Route path="/couponmanagementds" element={<Couponmanagementds />} />
        <Route path="/paymentinitiationds" element={<Paymentinitiationds />} />
        <Route path="/paymenthistoryds" element={<Paymenthistoryds />} />
        <Route path="/paymentstatusds" element={<Paymentstatusds />} />
        <Route path="/paymentcallbackds" element={<Paymentcallbackds />} />

        <Route path="/dashmmassets" element={<Dashmmassets />} />
        <Route path="/dashmmassetsadmin" element={<Dashmmassetsadmin />} />
        <Route path="/dashmmassetassign" element={<Dashmmassetassign />} />
        <Route path="/dashmmassetassignadmin" element={<Dashmmassetassignadmin />} />
        <Route path="/dashmmvendors" element={<Dashmmvendors />} />
        <Route path="/dashmmvendorsadmin" element={<Dashmmvendorsadmin />} />
        <Route path="/dashmmvendorbanks" element={<Dashmmvendorbanks />} />
        <Route path="/dashmmvendorbanksadmin" element={<Dashmmvendorbanksadmin />} />
        <Route path="/dashmmpurchase" element={<Dashmmpurchase />} />
        <Route path="/dashmmpurchaseadmin" element={<Dashmmpurchaseadmin />} />
        <Route path="/dashmmpurchaseitems" element={<Dashmmpurchaseitems />} />
        <Route path="/dashmmpurchaseitemsadmin" element={<Dashmmpurchaseitemsadmin />} />
        <Route path="/dashmmpopayments" element={<Dashmmpopayments />} />
        <Route path="/dashmmpopaymentsadmin" element={<Dashmmpopaymentsadmin />} />


        <Route path="/dashmmplacement" element={<Dashmmplacement />} />
        <Route path="/dashmmplacementadmin" element={<Dashmmplacementadmin />} />

        <Route path="/transformeroilgame" element={<TransformerOilStrengthGame />} />
        <Route path="/titrationgame" element={<TitrationGame />} />
        <Route path="/infraredgame" element={<InfraRedSpectrosGame />} />

        <Route path="/skeletonpart2game" element={<SkeletonExpPart2Game />} />
        <Route path="/getmoldgame" element={<GetMoldGame />} />
        <Route path="/opticalfibregame" element={<OpticalFibreGame />} />
        <Route path="/digitaltriradiigame" element={<DigitalTriradiiGame />} />


        <Route path="/infraredspectros" element={<InfraRedSpectros />} />
        <Route path="/skeletonpart2" element={<SkeletonExpPart2 />} />
        <Route path="/titration" element={<Titration />} />
        <Route path="/skeletonexp" element={<SkeletonExp />} />
        <Route path="/dcshuntmotor" element={<DCShuntMotorSimulation />} />
        <Route path="/fingerprintpatterns" element={<FingerPrintPatterns />} />
        <Route path="/digitaltriradii" element={<DigitalTriradii />} />
        <Route path="/dashmlpubeditionspublic" element={<Dashmlpubeditionspublic />} />
        <Route path="/dashmlpublicationspublic" element={<Dashmlpublicationspublic />} />
        <Route path="/dashmlpublications" element={<Dashmlpublications />} />
        <Route path="/dashmlpublicationsadmin" element={<Dashmlpublicationsadmin />} />
        <Route path="/dashmlpubeditions" element={<Dashmlpubeditions />} />
        <Route path="/dashmlpubeditionsadmin" element={<Dashmlpubeditionsadmin />} />
        <Route path="/dashmlpubreviews" element={<Dashmlpubreviews />} />
        <Route path="/dashmlpubreviewsadmin" element={<Dashmlpubreviewsadmin />} />
        <Route path="/dashmlpubarticles" element={<Dashmlpubarticles />} />
        <Route path="/dashmlpubarticlesadmin" element={<Dashmlpubarticlesadmin />} />


        <Route path="/dashmpasswordstud" element={<Dashmpasswordstud />} />
        <Route path="/dashmpassword" element={<Dashmpassword />} />
        <Route path="/transformeroilstrength" element={<TransformerOilStrength />} />
        <Route path="/opticalfibre" element={<OpticalFibre />} />
        <Route path="/stephanslaw" element={<StefansLaw />} />
        <Route path="/phasesequence" element={<PhaseSequenceSynchronous />} />

        <Route path="/dashmtestscoreall" element={<Dashmtestscoreall />} />
        <Route path="/dashawsconfig" element={<Dashawsconfig />} />

        <Route path="/dashmmvac" element={<Dashmmvac />} />
        <Route path="/dashmmvacadmin" element={<Dashmmvacadmin />} />


        <Route path="/Login" element={<Signinpage />} />
        <Route path="/signuppage" element={<SignupPage />} />
        <Route path="/campuswebsite" element={<CampusWebsite />} />
        <Route path="/circulareventsm" element={<Circulareventsm />} />
        <Route path="/dashmhtmleditor" element={<Dashmhtmleditor />} />
        <Route path="/videoshare/:videoid" element={<Videopagepreshare />} />
        <Route path="/videopage31" element={<Videopage32a />} />
        {/* <Route path="/videopage31" element={<Videopage31 />} /> */}
        <Route path="/videopage3" element={<Videopage3 />} />
        <Route path="/videopagepre" element={<Videopagepre />} />
        <Route path="/videopage2" element={<VideoPage2 />} />

        <Route path="/dashmlmsvideos" element={<Dashmlmsvideos />} />
        <Route path="/dashmlmsvideosadmin" element={<Dashmlmsvideosadmin />} />
        <Route path="/dashmlmsvideosc" element={<Dashmlmsvideosc />} />
        <Route path="/dashmlmsvideoscadmin" element={<Dashmlmsvideoscadmin />} />


        <Route path="/graytobinaryconverter" element={<GrayToBinaryConverter />} />
        <Route path="/bitserial" element={<BitSerial />} />
        <Route path="/bcdtoexcessconverter" element={<BCDToExcessConverter />} />
        <Route path="/codeeditor" element={<CodeEditor />} />
        <Route path="/videopage" element={<VideoPage />} />

        <Route path="/fullsubcircuitverify" element={<FullSubCircuitVerify />} />
        <Route path="/fullsubtractorcircuit" element={<FullSubtractorCircuit />} />
        <Route path="/halfsubcircuitverify" element={<HalfSubCircuitVerify />} />

        <Route path="/xnorgate" element={<XNORGate />} />
        <Route path="/xnorgate2" element={<XNORGate2 />} />
        <Route path="/xorgate2" element={<XORGate2 />} />
        
        <Route path="/halfsubtractorcircuit" element={<HalfSubtractorCircuit />} />
        <Route path="/xorgate" element={<XORGate />} />
        <Route path="/dashmgeotagtest" element={<Dashmgeotagtest />} />

        <Route path="/nandgate" element={<NANDGate />} />
        <Route path="/nandgate2" element={<NANDGate2 />} />
        <Route path="/norgate" element={<NORGate />} />
        <Route path="/norgate2" element={<NORGate2 />} />

        <Route path="/dashmtestqstud" element={<Dashmtestqstud />} />

        <Route path="/andgate" element={<ANDGate />} />
        <Route path="/andgate2" element={<ANDGate2 />} />
        <Route path="/orgate" element={<ORGate />} />
        <Route path="/orgate2" element={<ORGate2 />} />
        <Route path="/notgate" element={<NOTGate />} />
        <Route path="/notgate2" element={<NOTGate2 />} />


        <Route path="/binaryarithmetics" element={<BinaryArithmeticS />} />
        <Route path="/queuevisual" element={<QueueVisualization />} />
        <Route path="/binarysearch" element={<BinarySearch />} />

        <Route path="/binaryarith" element={<BinaryArithmeticSimulation />} />
        <Route path="/stackvisualization" element={<StackVisualization />} />
        <Route path="/arrayvisualization" element={<ArrayVisualization />} />

        <Route path="/dashmtestnewstud" element={<Dashmtestnewstud />} />
        
        <Route path="/codl" element={<CharacterizationOfDigitalLogic />} />
        
        <Route path="/insertionsort" element={<InsertionSort />} />
        <Route path="/selectionsort" element={<SelectionSort />} />

        <Route path="/dashmtestnew" element={<Dashmtestnew />} />
        <Route path="/dashmtestnewadmin" element={<Dashmtestnewadmin />} />
        <Route path="/dashmtestq" element={<Dashmtestq />} />
        <Route path="/dashmtestqadmin" element={<Dashmtestqadmin />} />
        <Route path="/dashmtesto" element={<Dashmtesto />} />
        <Route path="/dashmtestoadmin" element={<Dashmtestoadmin />} />


        <Route path="/dashmqualitative" element={<Dashmqualitative />} />
        <Route path="/dashmpolicy" element={<Dashmpolicy />} />
        <Route path="/dashmeventsnew1" element={<Dashmeventsnew1 />} />
        <Route path="/dashmeventsnew1admin" element={<Dashmeventsnew1admin />} />


        <Route path="/dashmslideshow" element={<Dashmslideshow />} />
        <Route path="/dashmslideshowadmin" element={<Dashmslideshowadmin />} />

        
        <Route path="/dashmscholnew" element={<Dashmscholnew />} />
        <Route path="/dashmscholnewadmin" element={<Dashmscholnewadmin />} />
        <Route path="/dashmstudawardsnew" element={<Dashmstudawardsnew />} />
        <Route path="/dashmstudawardsnewadmin" element={<Dashmstudawardsnewadmin />} />
        <Route path="/dashmscholnewstud" element={<Dashmscholnewstud />} />
        <Route path="/dashmstudawardsnewstud" element={<Dashmstudawardsnewstud />} />



        <Route path="/fourbitaddersubtractor" element={<FourBitAdderSubtractor />} />
        <Route path="/dashmclassnewstud" element={<Dashmclassnewstud />} />
        <Route path="/dashmclassnewc" element={<Dashmclassnewc />} />
        <Route path="/dashmattccode" element={<Dashmattccode />} />
        <Route path="/dashmattpcode" element={<Dashmattpcode />} />

        <Route path="/subhalfadder1" element={<SubHalfAdder1 />} />
        <Route path="/basiclogicgateexpfirst" element={<BasicLogicGateExpFirst />} />
        <Route path="/basiclogicgateexpsecond" element={<BasicLogicGateExpSecond />} />
        <Route path="/fullsubtractor" element={<FullSubtractor />} />
        <Route path="/halfsubtractor" element={<HalfSubtractor />} />
        <Route path="/twobitadder" element={<TwoBitAdder />} />

        <Route path="/dashmclassnew" element={<Dashmclassnew />} />
<Route path="/dashmclassnewadmin" element={<Dashmclassnewadmin />} />
<Route path="/dashmattendancenew" element={<Dashmattendancenew />} />
<Route path="/dashmattendancenewadmin" element={<Dashmattendancenewadmin />} />


        {/* <Route path="/resistor" element={<Resistor />} />
        <Route path="/bubblesort" element={<Bubblesort />} />
        <Route path="/firstsimulator" element={<Firstsimulator />} />
        <Route path="/secondsimulator" element={<SecondSimulator />} /> */}


        <Route path="/dashmquotanew" element={<Dashmquotanew />} />
<Route path="/dashmquotanewadmin" element={<Dashmquotanewadmin />} />


        <Route path="/dashmmassignsubmitfac" element={<Dashmmassignsubmitfac />} />

        <Route path="/dashmmassignsubmit" element={<Dashmmassignsubmit />} />
<Route path="/dashmmassignsubmitadmin" element={<Dashmmassignsubmitadmin />} />
<Route path="/dashmmdiscussion" element={<Dashmmdiscussion />} />
<Route path="/dashmmdiscussionadmin" element={<Dashmmdiscussionadmin />} />


        <Route path="/dashmmcoursecostud" element={<Dashmmcoursecostud />} />
        <Route path="/dashmmcoursematerialstud" element={<Dashmmcoursematerialstud />} />
        <Route path="/dashmmcalendarstud" element={<Dashmmcalendarstud />} />
        <Route path="/dashmmassignmentsstud" element={<Dashmmassignmentsstud />} />
        <Route path="/dashmmanouncementsstud" element={<Dashmmannouncementsstud />} />

        <Route path="/dashmmassignments" element={<Dashmmassignments />} />
<Route path="/dashmmassignmentsadmin" element={<Dashmmassignmentsadmin />} />
<Route path="/dashmmanouncements" element={<Dashmmanouncements />} />
<Route path="/dashmmanouncementsadmin" element={<Dashmmanouncementsadmin />} />
<Route path="/dashmmcourseco" element={<Dashmmcourseco />} />
<Route path="/dashmmcoursecoadmin" element={<Dashmmcoursecoadmin />} />
<Route path="/dashmmcalendar" element={<Dashmmcalendar />} />
<Route path="/dashmmcalendaradmin" element={<Dashmmcalendaradmin />} />
<Route path="/dashmmcoursematerial" element={<Dashmmcoursematerial />} />
<Route path="/dashmmcoursematerialadmin" element={<Dashmmcoursematerialadmin />} />


        <Route path="/dashmmsyllabus" element={<Dashmmsyllabus />} />
        
<Route path="/dashmmsyllabusadmin" element={<Dashmmsyllabusadmin />} />

<Route path="/dashmmsyllabusstud" element={<Dashmmsyllabusstud />} />

        <Route path="/dashmclassenr1" element={<Dashmclassenr1 />} />
<Route path="/dashmclassenr1admin" element={<Dashmclassenr1admin />} />
<Route path="/dashmclassenr1stud" element={<Dashmclassenr1stud />} />



        <Route path="/dashmmstudents1" element={<Dashmmstudents1 />} />
<Route path="/dashmmstudents1admin" element={<Dashmmstudents1admin />} />


        <Route path="/dashmmcourseslist" element={<Dashmmcourseslist />} />
<Route path="/dashmmcourseslistadmin" element={<Dashmmcourseslistadmin />} />


        <Route path="/dashmmcolevelscalc" element={<Dashmmcolevelscalc />} />

        <Route path="/dashmmcolevels" element={<Dashmmcolevels />} />
<Route path="/dashmmcolevelsadmin" element={<Dashmmcolevelsadmin />} />


        <Route path="/dashmmattcalc" element={<Dashmmattcalc />} />
<Route path="/dashmmattcalcadmin" element={<Dashmmattcalcadmin />} />


        <Route path="/dashmmfaccourses" element={<Dashmmfaccourses />} />
<Route path="/dashmmfaccoursesadmin" element={<Dashmmfaccoursesadmin />} />
<Route path="/dashmmfaccoursesatt" element={<Dashmmfaccoursesatt />} />
<Route path="/dashmmfaccoursesattadmin" element={<Dashmmfaccoursesattadmin />} />



        <Route path="/dashmmprograms" element={<Dashmmprograms />} />
<Route path="/dashmmprogramsadmin" element={<Dashmmprogramsadmin />} />
<Route path="/dashmmcourses" element={<Dashmmcourses />} />
<Route path="/dashmmcoursesadmin" element={<Dashmmcoursesadmin />} />
<Route path="/dashmmstudents" element={<Dashmmstudents />} />
<Route path="/dashmmstudentsadmin" element={<Dashmmstudentsadmin />} />
<Route path="/dashmexamtimetable" element={<Dashmexamtimetable />} />
<Route path="/dashmexamtimetableadmin" element={<Dashmexamtimetableadmin />} />


        
        <Route path="/loginstud" element={<Loginstud />} />
        <Route path="/dashmexamschedule" element={<Dashmexamschedule />} />
<Route path="/dashmexamscheduleadmin" element={<Dashmexamscheduleadmin />} />
<Route path="/dashmexamroom" element={<Dashmexamroom />} />
<Route path="/dashmexamroomadmin" element={<Dashmexamroomadmin />} />



        <Route path="/dashmpublications" element={<Dashmpublications />} />
<Route path="/dashmpublicationsadmin" element={<Dashmpublicationsadmin />} />
<Route path="/dashmpatents" element={<Dashmpatents />} />
<Route path="/dashmpatentsadmin" element={<Dashmpatentsadmin />} />
<Route path="/dashmteacherfellow" element={<Dashmteacherfellow />} />
<Route path="/dashmteacherfellowadmin" element={<Dashmteacherfellowadmin />} />
<Route path="/dashmconsultancy" element={<Dashmconsultancy />} />
<Route path="/dashmconsultancyadmin" element={<Dashmconsultancyadmin />} />
<Route path="/dashmphdguide" element={<Dashmphdguide />} />
<Route path="/dashmphdguideadmin" element={<Dashmphdguideadmin />} />
<Route path="/dashmseminar" element={<Dashmseminar />} />
<Route path="/dashmseminaradmin" element={<Dashmseminaradmin />} />
<Route path="/dashmbook" element={<Dashmbook />} />
<Route path="/dashmbookadmin" element={<Dashmbookadmin />} />



        <Route path="/dashmprojects" element={<Dashmprojects />} />
<Route path="/dashmprojectsadmin" element={<Dashmprojectsadmin />} />



        <Route path="/dashmncas22" element={<Dashmncas22 />} />
<Route path="/dashmncas22admin" element={<Dashmncas22admin />} />
<Route path="/dashmncas241" element={<Dashmncas241 />} />
<Route path="/dashmncas241admin" element={<Dashmncas241admin />} />
<Route path="/dashmncas23" element={<Dashmncas23 />} />
<Route path="/dashmncas23admin" element={<Dashmncas23admin />} />
<Route path="/dashmncas242" element={<Dashmncas242 />} />
<Route path="/dashmncas242admin" element={<Dashmncas242admin />} />
<Route path="/dashmncas243" element={<Dashmncas243 />} />
<Route path="/dashmncas243admin" element={<Dashmncas243admin />} />
<Route path="/dashmncas251" element={<Dashmncas251 />} />
<Route path="/dashmncas251admin" element={<Dashmncas251admin />} />
<Route path="/dashmncas252" element={<Dashmncas252 />} />
<Route path="/dashmncas252admin" element={<Dashmncas252admin />} />
<Route path="/dashmncas253" element={<Dashmncas253 />} />
<Route path="/dashmncas253admin" element={<Dashmncas253admin />} />
<Route path="/dashmncas26" element={<Dashmncas26 />} />
<Route path="/dashmncas26admin" element={<Dashmncas26admin />} />


<Route path="/dashboardcrmds" element={<DashboardCrmds />} />
        <Route path="/categoryds" element={<Categoryds />} />
        <Route path="/leadsds" element={<Leadsds />} />
        <Route path="/leaddetailds/:id" element={<Leaddetailds />} />
        <Route path="/programmasterds" element={<Programmasterds />} />
        <Route path="/landingpageds" element={<Landingpageds />} />
        <Route path="/dripcampaignds" element={<Dripcampaignds />} />
        <Route path="/apikeyds" element={<Apikeyds />} />
        <Route path="/analyticsds" element={<Analyticsds />} />
        <Route path="/landing/:slug" element={<Publiclandingpageds />} />
        <Route path="/communicationsettings" element={<CommunicationSettings />} />
        <Route path="/sourceds" element={<Sourceds />} />

        {/* API Configuration and Chatbot */}
<Route path="/apiconfig" element={<ApiConfig />} />
<Route path="/apichatbot" element={<ApiChatbot />} />
<Route path= "/apichatbot1" element= {<ApiChatbot1 />} />

        
      </Routes>
    </Router>
  );
}

export default App;
