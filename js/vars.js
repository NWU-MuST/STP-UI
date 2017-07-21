// Create a new string method
String.prototype.insertAt=function(index, string) { 
  return this.substr(0, index) + string + this.substr(index);
}

//APP SERVER URLs
// ADMIN
var ABASE_URL = "http://rkv-must1.puk.ac.za/app/admin"
var APP_ALOGIN = ABASE_URL + "/login";
var APP_ALOGOUT = ABASE_URL + "/logout";
var APP_ALOGOUT2 = ABASE_URL + "/logout2";
var APP_ALOADUSERS = ABASE_URL + "/loadusers";
var APP_AUSERINFO = ABASE_URL + "/userinfo";
var APP_AADDUSER = ABASE_URL + "/adduser";
var APP_ADELUSER = ABASE_URL + "/deluser";

// PROJECT
var PBASE_URL = "http://rkv-must1.puk.ac.za/app/projects"
var APP_PLOGIN = PBASE_URL + "/login";
var APP_PLOGOUT = PBASE_URL + "/logout";
var APP_PLOGOUT2 = PBASE_URL + "/logout2";
var APP_PRESETPASSWORD = PBASE_URL + "/resetpassword";
var APP_PLISTPROJECTS = PBASE_URL + "/listprojects";
var APP_PLISTCREATEDPROJECTS = PBASE_URL + "/listcreatedprojects";
var APP_PCREATEPROJECT = PBASE_URL + "/createproject";
var APP_PDELETEPROJECT = PBASE_URL + "/deleteproject";
var APP_PUPLOADAUDIO = PBASE_URL + "/uploadaudio";
var APP_PLOADPROJECT = PBASE_URL + "/loadproject";
var APP_PSAVEPROJECT = PBASE_URL + "/saveproject";
var APP_PASSIGNTASKS = PBASE_URL + "/assigntasks";
var APP_PLISTCATEGORIES = PBASE_URL + "/listcategories";
var APP_PLISTLANGUAGES = PBASE_URL + "/listlanguages";
var APP_PLOADUSERS = PBASE_URL + "/loadusers";
var APP_PGETAUDIO = PBASE_URL + "/getaudio";
var APP_PUPDATEPROJECT = PBASE_URL + "/updateproject";
var APP_PUNLOCKPROJECT = PBASE_URL + "/unlockproject";
var APP_PDIARIZEAUDIO = PBASE_URL + "/diarizeaudio";
var APP_PCLEARERROR = PBASE_URL + "/clearerror";
var APP_PCHANGEPASSWORD = PBASE_URL + "/changepassword";

// EDITOR
var EBASE_URL = "http://rkv-must1.puk.ac.za/app/editor"
var APP_ELOGIN = EBASE_URL + "/login";
var APP_ELOGOUT = EBASE_URL + "/logout";
var APP_ELOGOUT2 = EBASE_URL + "/logout2";
var APP_ELOADTASKS = EBASE_URL + "/loadtasks";
var APP_ELOADTASK = EBASE_URL + "/loadtask";
var APP_ELOADUSERS = EBASE_URL + "/loadusers";
var APP_EGETAUDIO = EBASE_URL + "/getaudio";
var APP_EGETTEXT = EBASE_URL + "/gettext";
var APP_ESAVETEXT = EBASE_URL + "/savetext";
var APP_ECLEARERROR = EBASE_URL + "/clearerror";
var APP_EUNLOCK = EBASE_URL + "/unlocktask";
var APP_EDIARIZE = EBASE_URL + "/diarize";
var APP_ERECOGNIZE = EBASE_URL + "/recognize";
var APP_EALIGN = EBASE_URL + "/align";
var APP_ETASKDONE = EBASE_URL + "/taskdone";
var APP_EREASSIGNTASK = EBASE_URL + "/reassigntask";
var APP_ELISTLANGUAGES = EBASE_URL + "/listlanguages";
var APP_ESPEECHSUBSYSTEMS = EBASE_URL + "/speechsubsystems";
var APP_EBUILDMASTER = EBASE_URL + "/buildmaster";
var APP_ECHANGEPASSWORD = EBASE_URL + "/changepassword";
var APP_EUNLOCKTASK = EBASE_URL + "/unlocktask";

// ROLES
var ADMIN_INTF = "Administrator";
var ADMIN_ROLE = "admin";
var PROJECT_INTF = "Project Manager";
var PROJECT_ROLE = "project";
var EDITOR_INTF = "Editor";
var EDITOR_ROLE = "editor";

// URLS
var LOGIN_URL = "/speechui/login/index.html";
var PROJECT_URL = "/speechui/projects/index.html";
var TASK_URL = "/speechui/tasks/index.html";
var EDITOR_URL = "/speechui/editor/index.html";
var JOB_URL = "/speechui/jobs/index.html";
var CHROME_URL = "https://www.google.com/chrome/browser/desktop/";
var ADMIN_URL = "/speechui/admin/index.html";
var HOME_URL = "/speechui/home/index.html";

