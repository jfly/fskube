#ifndef RECEIVERSENDER_H
#define RECEIVERSENDER_H

namespace fskube {

template <class InType> class Receiver {
    public:
        virtual ~Receiver() {};
        virtual void receive(InType in) = 0;
};

// It doesn't really make sense for Sender to be a subclass of Receiver,
// but doing it this way allows us to avoid multiple inheritance, which
// embind doesn't support =(.
template <class InType, class OutType> class Sender : public Receiver<InType> {
    protected:
        void send(OutType out) {
            if(nextReceiver) {
                nextReceiver->receive(out);
            }
        }
    private:
        Receiver<OutType> *nextReceiver;
    public:
        Sender() {
            nextReceiver = 0;
        }
        virtual ~Sender() {};
        void connect(Receiver<OutType> *next) {
            nextReceiver = next;
        }
};

}

#endif // RECEIVERSENDER_H
