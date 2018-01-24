(function(){

  var projects = {
    'project-name': {
      id: 'project-name',
      link: 'https://www.example.com/',
      title: 'A Project Name that is Aw Inspiring!',
      summary: 'Nunc vel quam rutrum ligula scelerisque placerat at in elit. Vestibulum id neque ante. Vivamus euismod tempor diam, vel rutrum tortor ornare sed.',
      description: 'Nunc vel quam rutrum ligula scelerisque placerat at in elit. Vestibulum id neque ante. Vivamus euismod tempor diam, vel rutrum tortor ornare sed. Donec non fringilla mi, sit amet malesuada justo. Nullam sed purus tortor. Donec ultrices ex vitae tellus eleifend malesuada. Suspendisse imperdiet tincidunt magna, id euismod sapien tempus eget. In eget euismod dolor. Suspendisse velit ex, commodo ut mollis et, efficitur at nunc. Proin nec mi et ipsum blandit euismod vitae id arcu.',
      image: 'a.png',
      info: {
        date: {
          created: '23.1.2018',
          edited: '24.1.2018'
        },
        labels: {
          tech: 'JS, CSS, HTML, Web Audio',
          tags: 'Synth, Program, Something'
        },
        links: {
          github: {
            name: '<i class="fab fa-github"></i>',
            text: 'Github',
            link: 'https://github.com/'
          }
        }
      }
    },
    'project-name-1': {
      id: 'project-name-1',
      link: 'https://www.example.com/',
      title: 'A Project Name that is Aw Inspiring!',
      summary: 'Nunc vel quam rutrum ligula scelerisque placerat at in elit. Vestibulum id neque ante. Vivamus euismod tempor diam, vel rutrum tortor ornare sed.',
      description: 'Nunc vel quam rutrum ligula scelerisque placerat at in elit. Vestibulum id neque ante. Vivamus euismod tempor diam, vel rutrum tortor ornare sed. Donec non fringilla mi, sit amet malesuada justo. Nullam sed purus tortor. Donec ultrices ex vitae tellus eleifend malesuada. Suspendisse imperdiet tincidunt magna, id euismod sapien tempus eget. In eget euismod dolor. Suspendisse velit ex, commodo ut mollis et, efficitur at nunc. Proin nec mi et ipsum blandit euismod vitae id arcu.',
      image: 'b.jpg',
      info: {
        date: {
          created: '23.1.2018',
          edited: '24.1.2018'
        },
        labels: {
          tech: 'JS, CSS, HTML, Web Audio',
          tags: 'Synth, Program, Something'
        },
        links: {
          github: {
            name: '<i class="fab fa-github"></i>',
            text: 'Github',
            link: 'https://github.com/'
          }
        }
      }
    }
  };

  var headPage = document.getElementById('head'),
      logoPage = document.getElementById('logo-page'),
      contactPage = document.getElementById('contact-page'),
      projectStack = document.getElementById('project-stack'),
      projectPage = document.getElementById('project-page');

  function createProject(projObj) {

    var projArr = [], projTitleArr = [];

    //Project Title HTML
    projTitleArr = projObj.title.split(' ');
    for(var i = 0; i < projTitleArr.length; i++) {
      projTitleArr[i] = '<span>' + projTitleArr[i] + '</span>';
    }
    projTitleArr = projTitleArr.join('');

    //Project Item Begin
    projArr.push(
      '<section id="' + projObj.id + '" class="project-item">',
        '<section class="project-image" style="background-image:' + " url('assets/img/" + projObj.image + "');" + '"></section>',
        '<section class="project-face">',
          '<p class="project-title">' + projTitleArr + '</p>',
          '<section class="project-summary">' + projObj.summary + '</section>',
          '<section class="project-menu">',
            '<a href="#/projects/view/' + projObj.id + '"><button class="project-details-button"><i class="fas fa-info"></i>Details</button></a>',
            '<a href="' + projObj.link + '"><button class="project-go-to">Go to App<i class="fas fa-arrow-circle-right"></i></button>',
          '</section>',
        '</section>',
      '</section>'
    );

    projArr = projArr.join('');

    projectStack.insertAdjacentHTML('beforeend', projArr);

  };

  for(var i = 0; i < Object.keys(projects).length; i++) {
    createProject(projects[Object.keys(projects)[i]]);
  }

  function openProjectPage(projId) {


    if(Object.keys(projects).indexOf(projId) > -1) {

      var projPageArr = [], projTitleArr = [],
      projLinkStr = '', projObj = projects[projId];

      //Project Title HTML
      projTitleArr = projObj.title.split(' ');
      for(var i = 0; i < projTitleArr.length; i++) {
        projTitleArr[i] = '<span>' + projTitleArr[i] + '</span>';
      }
      projTitleArr = projTitleArr.join('');

      //ProjectL Link Html
      for(var i = 0; i < Object.keys(projObj.info.links).length; i++) {

        var link = projObj.info.links[Object.keys(projObj.info.links)[i]];

        projLinkStr += '<a href="' + link.link + '">';
        projLinkStr += '<span class="project-info">';
        projLinkStr +=  '<label>' + link.name + '</label>';
        projLinkStr +=  '<div>' + link.text + '</div>';
        projLinkStr += '</span></a>';

      }

      projPageArr.push(
        '<section class="project-item">',
          '<section class="project-image" style="background-image:' + " url('assets/img/" + projObj.image + "');" + '"></section>',
          '<section class="project-face">',
            '<p class="project-title">' + projTitleArr + '</p>',
            '<section class="project-summary">' + projObj.description + '</section>',
            '<section class="project-info-container">',
              '<section class="project-info-collumn">',
                '<span class="project-info">',
                  '<label>Created</label><div>' + projObj.info.date.created + '</div>',
                '</span>',
                '<span class="project-info">',
                  '<label>Edited</label><div>' + projObj.info.date.edited + '</div>',
                '</span>',
                '<span class="project-info">',
                  '<label>Tech</label><div>' + projObj.info.labels.tech + '</div>',
                '</span>',
              '</section>',
              '<section class="project-info-collumn">',
                projLinkStr,
                '<span class="project-info">',
                  '<label>Tags</label><div>' + projObj.info.labels.tags + '</div>',
                '</span>',
              '</section>',
            '</section>',
            '<section class="project-menu">',
              '<a href="#/projects/' + projObj.id + '"><button class="project-details-button"><i class="fas fa-times"></i>Close</button></a>',
              '<a href="' + projObj.link + '"><button class="project-go-to">Go to App<i class="fas fa-arrow-circle-right"></i></button>',
            '</section>',
          '</section>',
        '</section>'
      );

      projPageArr = projPageArr.join('');

      projectPage.innerHTML = projPageArr;

      projectPage.classList.remove('hide');

      logoPage.style.overflow = "hidden";
      contactPage.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      
    }

  };

  function openLogoPage() {
    //headPage.scrollIntoView({behavior: "smooth"});
    logoPage.classList.remove('hide');
    contactPage.classList.add('hide');
    projectPage.classList.add('hide');
    document.body.style.overflow = 'visible';
  };

  function closeLogoPage() {
    headPage.scrollIntoView({behavior: "smooth"});
    logoPage.classList.add('hide');
    contactPage.classList.remove('hide');
  };

  function toProjects() {
    openLogoPage({scroll: false});
    projectStack.scrollIntoView({behavior: "smooth"});
  };

  function toProject(projId) {
    if(Object.keys(projects).indexOf(projId) > -1) {
      projItem = document.getElementById(projId);
      document.body.style.overflow = 'visible';
      projectPage.classList.add('hide');
      logoPage.removeAttribute('style');
      contactPage.removeAttribute('style');
      projItem.scrollIntoView({behavior: "smooth"});
      if(contactPage.classList.contains('hide') && logoPage.classList.contains('hide')) {
        logoPage.classList.remove('hide');
      }
    }
  };

  var routes = {
    '/contact-me': closeLogoPage,
    '/': openLogoPage,
    '/projects': toProjects,
    '/projects/view/:projId': openProjectPage,
    '/projects/:projId': toProject,
    '*': openLogoPage
  };

  console.log(routes);

  var router = Router(routes);

  router.init(['/']);

  router.on("/projects/view/?((\w|.)*)", function () {
    openLogoPage();
    console.log(1);
    projectPage.classList.add('hide');
    document.body.style.overflow = 'visible';
    headPage.scrollIntoView({behavior: "smooth"});
  });

})();
