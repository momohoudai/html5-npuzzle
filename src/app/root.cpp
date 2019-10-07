#include <yuu/time.h>
#include <constants.h>
#include <SDL.h>

#include "root.h"

namespace app {
	
	using namespace yuu;

	Root::Root() :
		window(nullptr), isRunning(true)
	{
		
	}

	Root::~Root() noexcept {

	}


	bool Root::init()
	{
		if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
			SDL_Log(SDL_GetError());
			return false;
		}

		/*if (TTF_Init() != 0) {
			SDL_Log(SDL_GetError());
			return false;
		}*/

		window = SDL_CreateWindow(
			"N-puzzle",
			SDL_WINDOWPOS_CENTERED,
			SDL_WINDOWPOS_CENTERED,
			gDisplayWidth,
			gDisplayHeight,
			SDL_WINDOW_SHOWN);

		if (!window) {
			SDL_Log(SDL_GetError());
			return false;
		}

		auto renderer = SDL_CreateRenderer(window, -1, 0);
		if (renderer == nullptr) {
			SDL_Log(SDL_GetError());
			return false;
		}


		return true;
	}

	void Root::run() {

		// tick once first to start the timer
		time.tick(); 

		

		// Game Loop
		while (isRunning) {
			time.tick();
			this->handleEvents();
			this->update();
			this->render();
			this->clean();
			SDL_Delay(10);
		}
	}



	void Root::render() {
		auto* renderer = SDL_GetRenderer(window);
		SDL_RenderClear(renderer);




		SDL_RenderPresent(renderer);
	}

	void Root::handleEvents() {
		SDL_Event e;
		while (SDL_PollEvent(&e)) {
			switch (e.type) {
			case SDL_QUIT:
				isRunning = false;
				break;
			}

		}
		
	}

	void Root::clean() 
	{
		
	}

	void Root::update() {
		float dt = time.getTimeElpased<float>();
	}

}