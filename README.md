### Grey's Magnificent Monorepo

Hello and welcome to my magnificent monorepo! The idea is for me to have some place to display the cool projects that I have been working on in order to broaden my horizons and gain some more programming experience. Of course, I do have a life, so this will tend to get updated sporadically. Special thanks to Github for providing me all the tools to deploy my own website for free and with minimal hassle!

Just to be clear, this is a continuous deployment repo; every time I commit, the website is rebuilt and redeployed with zero downtime to the domain [greysmm.github.io](https://greysmm.github.io). So if you are currious about some of the projects, give the site a look! If you are more concerned with their implementation, check out the packages directory, which has a directory for each project's code; there are also two special packages, shared has some generic react components that may be used across projects and core is the directory for the main/home page.

Other things of note are the .github/workflows directory which holds web.yml, the github action file I use to deploy at each push, and the api directory which is essentially just a place for static assets at this time. With respect to the scope of this project, I have no particular need for a database or backend, and since everything here is public trying to implement something like that would have security issues. I may implement a proof of concept backend at some point in the future, but for now I will be focusing on the frontend.

You can run everything locally with `pnpm dev`.