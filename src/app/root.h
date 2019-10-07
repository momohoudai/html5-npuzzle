#ifndef __APP_ROOT_H__
#define __APP_ROOT_H__

#include <functional>
#include <yuu/time.h>

namespace app {
	class Root {
	public:
		SDL_Window* window;
		yuu::Time time;
		bool isRunning;

		Root();
		~Root() noexcept;

		bool init();
		void run();

	private:
		void update();
		void render();
		void handleEvents();
		void clean();
	};
}



#endif