import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Clock, CreditCard, ChefHat, ArrowRight, Smartphone, Zap, GraduationCap, Store } from "lucide-react";

const Index: React.FC = () => {
  const features = [
    { icon: <Smartphone className="h-8 w-8" />, title: "Order from Anywhere", description: "Place your order from classroom, library, or anywhere on campus" },
    { icon: <Clock className="h-8 w-8" />, title: "Skip the Queue", description: "No more waiting in long lines. Get notified when your order is ready" },
    { icon: <CreditCard className="h-8 w-8" />, title: "Pay Online", description: "Pay online or at the counter - whatever works for you" },
    { icon: <ChefHat className="h-8 w-8" />, title: "Fresh & Hot", description: "Your food is prepared fresh and kept ready for pickup" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Smart Campus Canteen Pre-Order System
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Order Food,{" "}
              <span className="gradient-text">Skip the Queue</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Zappadu lets you pre-order food from 3 canteen shops on campus.
              Choose your shop, order, pay online, and pick up when ready!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/login">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Student Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Store className="mr-2 h-5 w-5" />
                  Shop Owner Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to skip the canteen queue</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Choose a Shop", desc: "Browse 3 canteen shops and pick your favorite" },
              { step: "2", title: "Order & Pay", desc: "Select items, add to cart, and pay online" },
              { step: "3", title: "Pick Up", desc: "Get notified when ready and collect from the shop" },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full gradient-hero text-primary-foreground text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Students Love <span className="gradient-text">Zappadu</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-2xl border bg-card card-hover text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl gradient-hero text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Time?</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Join students who are already enjoying faster, smarter canteen ordering.
            </p>
            <Link to="/login">
              <Button variant="secondary" size="xl" className="btn-glow">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
